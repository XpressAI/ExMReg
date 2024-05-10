<script>
  import {
    globalKwargs,
    steps,
    alignmentCatalog,
    metricsCatalog,
    optimizersCatalog,
    samplingStrategiesCatalog,
    interpolatorsCatalog,
    shrinkFactorsCatalog,
    smoothSigmasCatalog
  } from './store'
  import { createEventDispatcher } from 'svelte'
  export let editing
  export let currentStep
  export let saveStep

  const dispatch = createEventDispatcher()

  function cancel() {
    dispatch('cancel')
  }

  function save() {
    saveStep(currentStep)
    dispatch('save')
  }
</script>

<div class="t-config-container" style={editing ? 'display: flex;' : 'display: none;'}>
  <div class="t-config">
    <p>Transformation Configuration</p>

    <div class="t-config-row">
      <input
        on:change={(e) => (currentStep = { ...currentStep, name: e.target.value })}
        value={currentStep.name}
      />

      <select
        on:change={(e) => {
          const selectedItem = $alignmentCatalog.find((item) => item.function === e.target.value)
          currentStep = {
            id: currentStep.id,
            name: selectedItem.name,
            function: selectedItem.function,
            kwargs: { ...selectedItem.kwargs }
          }
        }}
        value={currentStep.function}
      >
        <option value="" disabled selected>Select</option>
        {#each $alignmentCatalog as item (item.function)}
          <option value={item.function}>{item.function}</option>
        {/each}
      </select>
    </div>

    {#if currentStep.function}
      <div class="t-config-row">
        <p>Metric</p>
        <select
          on:change={(e) => {
            currentStep.kwargs.metric = e.target.value
            currentStep.kwargs.metric_args = $metricsCatalog.find(
              (item) => item.id === e.target.value
            ).args
          }}
          value={currentStep.kwargs.metric}
        >
          <option value="" disabled selected>Select</option>
          {#each $metricsCatalog as item (item)}
            <option value={item.id}>{item.name}</option>
          {/each}
        </select>
      </div>

      <div class="t-config-row">
        <p>Metric Args</p>
        <div class="t-config-col">
          {#each Object.keys(currentStep.kwargs.metric_args) as key}
            <p>{key}</p>
            <input
              on:change={(e) => {
                currentStep.kwargs.metric_args[key] = Number(e.target.value)
              }}
              value={currentStep.kwargs.metric_args[key]}
            />
          {/each}
        </div>
      </div>

      <div class="t-config-row">
        <p>Optimizer</p>
        <select
          on:change={(e) => {
            currentStep.kwargs.optimizer = e.target.value
            currentStep.kwargs.optimizer_args = $optimizersCatalog.find(
              (item) => item.id === e.target.value
            ).args
          }}
          value={currentStep.kwargs.optimizer}
        >
          <option value="" disabled selected>Select</option>
          {#each $optimizersCatalog as item (item)}
            <option value={item.id}>{item.name}</option>
          {/each}
        </select>
      </div>

      <div class="t-config-row">
        <p>Optimizer Args</p>
        <div class="t-config-col">
          {#each Object.keys(currentStep.kwargs.optimizer_args) as key}
            <p>{key}</p>
            <input
              on:change={(e) => {
                if (key === 'exhaustive_step_sizes') {
                  currentStep.kwargs.optimizer_args[key] = JSON.parse(e.target.value)
                } else {
                    currentStep.kwargs.optimizer_args[key] = Number(e.target.value)
                }
              }}
              value={JSON.stringify(currentStep.kwargs.optimizer_args[key])}
            />
          {/each}
        </div>
      </div>

      <div class="t-config-row">
        <p>Sampling Strategies</p>
        <select
          on:change={(e) => {
            currentStep.kwargs.sampling = e.target.value
            if (e.target.value !== 'NONE') {
              currentStep.kwargs.sampling_percentage = 0.1
            } else {
              currentStep.kwargs.sampling_percentage = null
            }
          }}
          value={currentStep.kwargs.sampling}
        >
          <option value="" disabled selected>Select</option>
          {#each $samplingStrategiesCatalog as item (item)}
            <option value={item.id}>{item.name}</option>
          {/each}
        </select>
        {#if currentStep.kwargs.sampling !== 'NONE'}
          <input
            on:change={(e) => {
              currentStep.kwargs.sampling_percentage = Number(e.target.value)
            }}
            value={currentStep.kwargs.sampling_percentage}
          />
        {/if}
      </div>

      <div class="t-config-row">
        <p>Interpolator</p>
        <select
          on:change={(e) => {
            currentStep.kwargs.interpolator = e.target.value
          }}
          value={currentStep.kwargs.interpolator}
        >
          <option value="" disabled selected>Select</option>
          {#each $interpolatorsCatalog as item (item)}
            <option value={item.id}>{item.name}</option>
          {/each}
        </select>
      </div>

      <div class="t-config-row">
        <p>Shrink Factors</p>
        <input
          on:change={(e) => {
            currentStep.kwargs.shrink_factors = JSON.parse(e.target.value)
          }}
          value={JSON.stringify(currentStep.kwargs.shrink_factors)}
        />
      </div>

      <div class="t-config-row">
        <p>Smooth Sigmas</p>
        <input
          on:change={(e) => {
            currentStep.kwargs.smooth_sigmas = JSON.parse(e.target.value)
          }}
          value={JSON.stringify(currentStep.kwargs.smooth_sigmas)}
        />
      </div>
    {/if}

    <div class="tcc-buttons">
      <button on:click={cancel}>Cancel</button>
      <button on:click={save}>Save</button>
    </div>
  </div>
</div>

<style>
  .t-config-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    z-index: 1;
    position: fixed;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .t-config {
    height: 80vh;
    width: 60vw;
    background-color: #efefef;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: scroll;
  }

  .t-config-row {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    margin: 1vh;
  }

  .t-config-row {
    display: flex;
    flex-direction: col;
    justify-content: space-evenly;
    align-items: center;
    width: 90%;
    margin: 0.5vh;
  }

  .tcc-buttons {
    margin: 5vh;
  }
</style>
