from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import dask.array as da
from bigstream.align import alignment_pipeline
from bigstream.transform import apply_transform
import napari
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Union
import uvicorn


app = FastAPI()

print("Starting the backend server.")

allowed_origins = [
    "http://localhost:3000",  # Adjust this to the origin you are requesting from
    "http://localhost:5173",  # Add more origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class TransformRequest(BaseModel):
    fix: str
    mov: str
    fix_spacing: List[float]
    mov_spacing: List[float]
    steps: List
    fix_mask: Optional[Union[List, None]] = None
    mov_mask: Optional[Union[List, None]] = None
    fix_origin: Optional[Union[List, None]] = None
    mov_origin: Optional[Union[List, None]] = None
    kwargs: dict  # These are global kwargs for the alignment pipeline, overwritten by kwargs in steps


class SuccessResponse(BaseModel):
    message: str


def load_image_from_path(image_path):
    return da.from_zarr(image_path)


@app.post("/apply_alignment/", response_model=SuccessResponse)
async def apply_alignment(request: TransformRequest):
    fix = load_image_from_path(request.fix).compute()
    mov = load_image_from_path(request.mov).compute()

    fix_spacing = np.array(request.fix_spacing)
    mov_spacing = np.array(request.mov_spacing)

    steps = [(step[0], step[1]) for step in request.steps]

    fix_mask = np.array(request.fix_mask) if request.fix_mask is not None else None
    mov_mask = np.array(request.mov_mask) if request.mov_mask is not None else None

    fix_origin = (
        np.array(request.fix_origin) if request.fix_origin is not None else None
    )
    mov_origin = (
        np.array(request.mov_origin) if request.mov_origin is not None else None
    )

    transform = alignment_pipeline(
        fix=fix,
        mov=mov,
        fix_spacing=fix_spacing,
        mov_spacing=mov_spacing,
        steps=steps,
        fix_mask=fix_mask,
        mov_mask=mov_mask,
        fix_origin=fix_origin,
        mov_origin=mov_origin,
        **request.kwargs
    )

    transformed_image = apply_transform(
        fix=fix,
        mov=mov,
        fix_spacing=fix_spacing,
        mov_spacing=mov_spacing,
        transform_list=[
            transform,
        ],
    )

    viewer = napari.Viewer()
    viewer.add_image(transformed_image)
    napari.run()

    return SuccessResponse(message="Image is being displayed in Napari.")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
