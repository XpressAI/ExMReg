<script>
  import { globalKwargs, steps, alignmentCatalog, metricsCatalog, optimizersCatalog, samplingStrategiesCatalog, interpolatorsCatalog, shrinkFactorsCatalog, smoothSigmasCatalog } from './store'
  import TransformationConfig from './TransformationConfig.svelte';
  import { onMount } from 'svelte'
  import { dndzone } from 'svelte-dnd-action';

  let editing = false
  let currentStep = {}

  // do one for both fix and move
  function openFileDialog(type) {
    window.electron.ipcRenderer.send('open-file-dialog', type)
  }

  onMount(() => {
    window.electron.ipcRenderer.on('file-processed', (_, type, path) => {
      globalKwargs.update((obj) => {
        obj[type] = path
        return obj
      })

      window.document.getElementById(`${type}-name`).textContent = path.split('/').pop()
      console.log(type, path)
    })

    window.electron.ipcRenderer.on('file-processed-error', (_, errorMessage) => {
      console.error('Error processing file:', errorMessage)
      // doesn't show an error message to the user
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('file-processed')
      window.electron.ipcRenderer.removeAllListeners('file-processed-error')
    }
  })

  // New approach
  async function applyAlignment() {
    
    const data = {
      fix: $globalKwargs.fix,
      mov: $globalKwargs.mov,
      fix_spacing: $globalKwargs.fix_spacing,
      mov_spacing: $globalKwargs.mov_spacing,
      steps: $steps.map((step) => [step.function, step.kwargs]),
      fix_mask: $globalKwargs.fix_mask,
      mov_mask: $globalKwargs.mov_mask,
      fix_origin: $globalKwargs.fix_origin,
      mov_origin: $globalKwargs.mov_origin,
      kwargs: {} // Not really necessary, just for global argument changes. Seems redundant
    }

    const response = await fetch('http://localhost:8000/apply_alignment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const message = `An error has occurred: ${response.statusText}`
      throw new Error(message)
    }

    const responseData = await response.json()
    console.log(responseData)
  }

  function generateId() {
    return Math.floor(Math.random() * 90000) + 10000;
  }

  function handleDndUpdate(event) {
    $steps = event.detail.items;
  }

  function saveStep(updatedStep) {
    $steps = $steps.map(step => {
      if (step.id === updatedStep.id) {
        return updatedStep;
      }
      return step;
    });
    editing = false;
  }
</script>


<TransformationConfig 
  {editing} 
  {currentStep} 
  {saveStep}
  on:cancel={() => {editing = false; currentStep = {}}} 
  on:save={() => editing = false}
/>
<main>
  <div class="config">
    <div class="input-container">
      <label for="input-fix">Fix Image</label>
      <div style="display: flex; flex-direction: row;">
        <button name="input-fix" on:click={() => openFileDialog('fix')}>Select File</button>
        <p id="fix-name"></p>
      </div>
    </div>
    <div class="input-container">
      <label for="input-move">Move Image</label>
      <div style="display: flex; flex-direction: row;">
        <button name="input-move" on:click={() => openFileDialog('mov')}>Select File</button>
        <p id="mov-name"></p>
      </div>
    </div>
    <div class="apply-transform-kwargs">
      <div class="input-container">
        <label for="input-apply-transform-fix-spacing">Fix Spacing</label>
        <input
          name="input-apply-transform-fix-spacing"
          class="file-input"
          type="text"
          on:change={(e) => {
            $globalKwargs.fix_spacing = JSON.parse(e.target.value)
          }}
          value={JSON.stringify($globalKwargs.fix_spacing)}
        />
      </div>
      <div class="input-container">
        <label for="input-apply-transform-mov-spacing">Move Spacing</label>
        <input
          name="input-apply-transform-mov-spacing"
          class="file-input"
          type="text"
          on:change={(e) => {
            $globalKwargs.mov_spacing = JSON.parse(e.target.value)
          }}
          value={JSON.stringify($globalKwargs.mov_spacing)}
        />
      </div>
    </div>
    <div class="controls-container">
      <button on:click={applyAlignment}>Run</button>
    </div>
  </div>
  <div class="transformations">
    <div class="t-edit">
      <h4>Transformation List</h4>
      <button on:click={() => $steps = []}>Clear</button>
    </div>
    <div class="t-list">
      <div use:dndzone="{{items: $steps}}" on:consider={handleDndUpdate} on:finalize={handleDndUpdate} class="dnd-container">
        {#each $steps as step (step.id)}
          <div class="t-item" data-id={step.id}>
            <p>{step.name}</p>
            <div>
              <button on:click={() => {
                editing = !editing
                currentStep = JSON.parse(JSON.stringify(step));
              }}>Edit</button>
              <button on:click={() => $steps = $steps.filter((s) => s.id !== step.id)}>Remove</button>
            </div>
          </div>
        {/each}
      </div>
      <button class="t-add" on:click={() => $steps = [...$steps, { id: generateId(), name: 'New Transformation', kwargs: {} }]}>Add</button>
    </div>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    height: 100vh;
  }

  button {
    height: 2em;
    width: 6em;
    cursor: pointer;
  }

  p {
    margin: 0 0 0 1em;
  }

  .config {
    display: flex;
    flex-direction: column;
    background-color: #efefef;
    border-radius: 15px;
    width: 40vw;
    height: 80vh;
  }

  .input-container {
    margin: 8%;
    display: flex;
    flex-direction: column;
  }

  .input-container label {
    margin-bottom: 4%;
  }

  .controls-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 8%;
  }

  .transformations {
    display: flex;
    flex-direction: column;
    background-color: #efefef;
    border-radius: 15px;
    width: 40vw;
    height: 80vh;
  }

  .t-edit {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 1vh 2vw;
  }

  .t-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .t-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 10vh;
    padding: 0 1vw;
    border-bottom: 1px solid #ccc;
  }

  .t-add {
    width: 90%;
    height: 8vh;
    cursor: pointer;
    text-align: center;
    margin: 2vh 2vw;
  }
</style>
