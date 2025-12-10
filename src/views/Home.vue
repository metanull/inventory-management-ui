<template>
  <div>
    <div class="mb-8">
      <Title variant="page" description="Welcome to the Virtual Office for MWNF!"> Homepage </Title>
    </div>

    <div class="flex flex-col mb-8 space-y-8">
      <div>
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            class="flex items-center p-2 rounded"
            :aria-pressed="showCategories"
            :title="showCategories ? 'Collapse section' : 'Expand section'"
            @click="toggleCategories"
          >
            <MinusCircleIcon v-if="showCategories" class="w-8 h-8 mr-4" />
            <PlusCircleIcon v-else class="w-8 h-8 mr-4" />
            <div class="text-xl font-semibold">Categories</div>
          </button>
        </div>
        <div v-show="showCategories" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Contexts Management Card -->
          <NavigationCard
            title="Contexts"
            main-color="green"
            button-text="Manage"
            button-route="/contexts"
          >
            <template #icon>
              <ContextIcon />
            </template>
          </NavigationCard>

          <!-- Projects Management Card -->
          <NavigationCard
            title="Projects"
            main-color="orange"
            button-text="Manage"
            button-route="/projects"
          >
            <template #icon>
              <ProjectIcon />
            </template>
          </NavigationCard>
        </div>
      </div>

      <div>
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <button
              type="button"
              class="flex items-center p-2 rounded"
              :aria-pressed="showLists"
              :title="showLists ? 'Collapse section' : 'Expand section'"
              @click="toggleLists"
            >
              <MinusCircleIcon v-if="showLists" class="w-8 h-8 mr-4" />
              <PlusCircleIcon v-else class="w-8 h-8 mr-4" />
              <div class="text-xl font-semibold">Lists</div>
            </button>
          </div>
        </div>
        <div v-show="showLists" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Languages Management Card -->
          <NavigationCard
            title="Languages"
            main-color="purple"
            button-text="Manage"
            button-route="/languages"
          >
            <template #icon>
              <LanguageIcon />
            </template>
          </NavigationCard>

          <!-- Countries Management Card -->
          <NavigationCard
            title="Countries"
            main-color="blue"
            button-text="Manage"
            button-route="/countries"
          >
            <template #icon>
              <CountryIcon />
            </template>
          </NavigationCard>

          <!-- Glossary Management Card -->
          <NavigationCard
            title="Glossary"
            main-color="blue"
            button-text="Manage"
            button-route="/glossary"
          >
            <template #icon>
              <GlossaryIcon />
            </template>
          </NavigationCard>
        </div>
      </div>

      <div>
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <button
              type="button"
              class="flex items-center p-2 rounded"
              :aria-pressed="showMisc"
              :title="showMisc ? 'Collapse section' : 'Expand section'"
              @click="toggleMisc"
            >
              <MinusCircleIcon v-if="showMisc" class="w-8 h-8 mr-4" />
              <PlusCircleIcon v-else class="w-8 h-8 mr-4" />
              <div class="text-xl font-semibold">Miscellaneous</div>
            </button>
          </div>
        </div>
        <div v-show="showMisc" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- System Status Card -->
          <StatusCard
            title="System Status"
            :description="apiStatusDescription"
            :main-color="apiStatusColor"
            :status-text="apiStatusText"
            toggle-title="API Server"
            :is-active="isApiUp"
            :loading="apiLoading"
            :disabled="true"
            active-icon-background-class="bg-green-100"
            inactive-icon-background-class="bg-red-100"
            active-icon-class="text-green-600"
            inactive-icon-class="text-red-600"
            :active-icon-component="CheckCircleIcon"
            :inactive-icon-component="XCircleIcon"
            @toggle="checkApiStatus"
          >
            <template #icon>
              <SystemIcon />
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
              <FeaturesIcon />
            </template>
          </InformationCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import NavigationCard from '@/components/format/card/NavigationCard.vue'
  import StatusCard from '@/components/format/card/StatusCard.vue'
  import InformationCard from '@/components/format/card/InformationCard.vue'
  import Title from '@/components/format/title/Title.vue'
  import {
    CheckCircleIcon,
    XCircleIcon,
    LanguageIcon,
    GlobeAltIcon as CountryIcon,
    BookOpenIcon as GlossaryIcon,
    CogIcon as ContextIcon,
    FolderIcon as ProjectIcon,
    CpuChipIcon as SystemIcon,
    AdjustmentsHorizontalIcon as FeaturesIcon,
    PlusCircleIcon,
    MinusCircleIcon,
  } from '@heroicons/vue/24/solid'
  import { useApiStatus } from '@/composables/useApiStatus'

  const { isApiUp, loading: apiLoading, checkApiStatus } = useApiStatus()

  const apiStatusText = computed(() => {
    if (apiLoading.value) return 'Checking...'
    return isApiUp.value ? 'API Online' : 'API Offline'
  })

  const apiStatusDescription = computed(() => {
    if (apiLoading.value) return 'Checking API server connection...'

    if (isApiUp.value) {
      return 'Connected to the API server'
    }

    return 'Unable to connect to the API server. Please check your connection.'
  })

  const apiStatusColor = computed(() => {
    return isApiUp.value ? 'green' : 'red'
  })

  // Section visibility state
  const showCategories = ref<boolean>(true)
  const showLists = ref<boolean>(false)
  const showMisc = ref<boolean>(false)

  // Toggle functions for show/hide
  const toggleCategories = (): void => {
    showCategories.value = !showCategories.value
  }

  const toggleLists = (): void => {
    showLists.value = !showLists.value
  }

  const toggleMisc = (): void => {
    showMisc.value = !showMisc.value
  }
</script>
