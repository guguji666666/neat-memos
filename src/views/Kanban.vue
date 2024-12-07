<template>
  <v-container>
    <mobile-drawer-controls hide-right />
    <div class="d-flex justify-space-between align-center">
      <template v-if="kanbanStore.projects.length">
        <v-tabs
          v-model="kanbanStore.selectedProject"
          align-tabs="center"
          color="orange"
        >
          <v-tab
            v-for="project in kanbanStore.filteredProjects"
            :key="project.id"
            rounded="0"
            :value="project.id"
            class="text-transform-inh"
          >
            <span class="mr-2">
              {{ project.name }}
            </span>
            <v-btn
              icon="mdi-close-circle"
              density="compact"
              color="grey"
              variant="text"
              size="small"
              :disabled="kanbanStore.interactionsDisabled"
              @click="deleteProject(project.id)"
            />
          </v-tab>
        </v-tabs>
      </template>
      <span
        class="text-grey-lighten-1 text-h6"
        v-else
      >
        No projects found.
      </span>
      <div class="d-flex flex-gap">
        <v-text-field
          density="compact"
          placeholder="Search"
          hide-details="auto"
          clearable
          class="search-input"
          v-model="kanbanStore.searchText"
          :disabled="kanbanStore.loading"
        />
        <v-btn
          :loading="kanbanStore.loading"
          :disabled="kanbanStore.interactionsDisabled"
          color="green"
          icon
          rounded="0"
          variant="tonal"
          size="small"
          @click="kanbanStore.projectDialog = true"
        >
          <v-icon> mdi-plus </v-icon>
          <v-tooltip
            activator="parent"
            location="end"
          >
            Add project
          </v-tooltip>
        </v-btn>
        <v-btn
          :loading="kanbanStore.loading"
          :disabled="kanbanStore.interactionsDisabled"
          color="blue"
          icon
          rounded="0"
          variant="tonal"
          size="small"
          @click="kanbanStore.columnDialog = true"
        >
          <v-icon> mdi-table-column-plus-before </v-icon>
          <v-tooltip
            activator="parent"
            location="end"
          >
            Add column
          </v-tooltip>
        </v-btn>
      </div>
    </div>
    <v-row v-if="loading">
      <v-progress-circular
        class="my-6 mx-auto"
        color="orange"
        size="50"
        indeterminate
      />
    </v-row>
    <v-window
      v-if="!loading"
      v-model="kanbanStore.selectedProject"
      class="project-window mt-5"
    >
      <v-window-item
        v-for="project in kanbanStore.filteredProjects"
        :transition="false"
        :reverse-transition="false"
        :key="`tabItem_${project.id}`"
        :value="project.id"
        class="h-100"
      >
        <kanban-project :project="project" />
      </v-window-item>
    </v-window>
  </v-container>
  <kanban-card-dialog />
  <project-dialog />
  <column-dialog />
</template>

<script setup lang="ts">
import ColumnDialog from "@/components/columnDialog/ColumnDialog.vue";
import KanbanCardDialog from "@/components/kanban/KanbanCardDialog.vue";
import KanbanProject from "@/components/kanban/KanbanProject.vue";
import ProjectDialog from "@/components/projectDialog/ProjectDialog.vue";
import { useConfirmationDialog } from "@/composables/useConfirmationDialog";
import { useKanbanStore } from "@/store/kanban";
import { onMounted, ref } from "vue";

const kanbanStore = useKanbanStore();
const createConfirmationDialog = useConfirmationDialog();

const loading = ref(false);

const deleteProject = async (projectId: number) => {
  if (kanbanStore.interactionsDisabled) return;
  const answer = await createConfirmationDialog();
  if (answer) {
    await kanbanStore.deleteProject(projectId);
  }
};

onMounted(async () => {
  loading.value = true;
  await kanbanStore.loadProjects();
  loading.value = false;
});
</script>

<style scoped>
.project-window {
  height: calc(100vh - 110px);
  overflow: auto;
}

.search-input {
  width: 200px;
}
</style>
