<script lang="ts">
  import { selectedBoundaryMap } from '../../stores';
  import { layers } from '../../assets/boundaries';
  import SidebarHeader from './SidebarHeader.svelte';

  type LayerGroup = {
    key: string;
    value: (typeof layers)[keyof typeof layers];
  }[];
  type GroupedLayers = Record<string, LayerGroup>;

  let groupedLayers = Object.entries(layers).reduce<GroupedLayers>(
    (acc, [key, value]) => {
      const group = value.group || 'Ungrouped';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push({ key, value });
      return acc;
    },
    {}
  );
</script>

<SidebarHeader title="BLR Boundaries" />

<div class="p-4 space-y-4">
  <p class="text-sm text-gray-500 font-medium">Select a boundary</p>
  <div class="space-y-2">
    {#each Object.entries(groupedLayers) as [group, groupLayers]}
      <div class="space-y-2">
        {#if group !== 'Ungrouped'}
          <h3 class="text-sm font-semibold text-gray-600 uppercase">{group}</h3>
          <div class="ml-4 space-y-1">
            {#each groupLayers as { key, value }}
              <button
                on:click={() => selectedBoundaryMap.set(key)}
                class="flex items-center w-full p-2 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <span class="mr-2 text-gray-400">{value.icon}</span>
                <span class="text-gray-700">{value.name}</span>
              </button>
            {/each}
          </div>
        {:else}
          {#each groupLayers as { key, value }}
            <button
              on:click={() => selectedBoundaryMap.set(key)}
              class="flex items-center w-full p-2 text-left -ml-2 text-sm rounded-lg hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span class="mr-2 text-gray-400">{value.icon}</span>
              <span class="text-gray-700">{value.name}</span>
            </button>
          {/each}
        {/if}
      </div>
    {/each}
  </div>
</div>
