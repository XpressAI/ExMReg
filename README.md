# ExMReg
An application for the registration and alignment of Expansion Microscopy data.

## Project Setup

### Install

```bash
# Node packages
$ npm install

# Python packages
$ pip install -r requirements.txt
```

### Development

```bash
$ npm run dev
```

## Alignment Instructions

After installing all required node and python packages and running the application with
```bash
$ npm run dev
```

To execute alignment:
- Select fix and move zarr files from your local machine. Be sure to select the root zarr file.
- Set all spacing information according to the appropriate dimensionality of your data, following the placeholder format.
- Add your transformation steps in the right hand column and edit them to set their configuration. All options can be adjusted within the transformation step edit window.
- Save your newly edited transformation step.
- Drag and drop alignment steps to adjust the order in which they execute.
- Click run to execute the transformations.

### Build (not currently supported)

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```