<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-sm text-gray-600">Welcome to the Inventory Management System</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Languages Management Card -->
      <NavigationCard
        title="Languages"
        description="Manage system languages and localization settings"
        main-color="blue"
        button-text="Manage Languages"
        button-route="/languages"
      >
        <template #icon>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
        </template>
      </NavigationCard>

      <!-- Countries Management Card -->
      <NavigationCard
        title="Countries"
        description="Manage countries and geographic regions"
        main-color="green"
        button-text="Manage Countries"
        button-route="/countries"
      >
        <template #icon>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </template>
      </NavigationCard>

      <!-- Contexts Management Card -->
      <NavigationCard
        title="Contexts"
        description="Manage system contexts and operational environments"
        main-color="purple"
        button-text="Manage Contexts"
        button-route="/contexts"
      >
        <template #icon>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </template>
      </NavigationCard>

      <!-- Projects Management Card -->
      <NavigationCard
        title="Projects"
        description="Manage projects, collections with launch dates and status"
        main-color="orange"
        button-text="Manage Projects"
        button-route="/projects"
      >
        <template #icon>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </template>
      </NavigationCard>

      <!-- System Status Card -->
      <StatusCard
        title="System Status"
        description="You are successfully authenticated and connected to the system."
        main-color="green"
        status-text="Connected"
      >
        <template #icon>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </template>
      </StatusCard>

      <!-- More Features Coming Soon Card -->
      <InformationCard
        title="Additional Features"
        description="More inventory management features like items, addresses, and details will be implemented in future iterations."
        main-color="gray"
        pill-text="Coming Soon"
      >
        <template #icon>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
            />
          </svg>
        </template>
      </InformationCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import NavigationCard from '@/components/home/NavigationCard.vue'
  import StatusCard from '@/components/home/StatusCard.vue'
  import InformationCard from '@/components/home/InformationCard.vue'
</script>
