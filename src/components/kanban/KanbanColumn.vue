<template>
  <div
    class="font-weight-bold text-white bg-orange-lighten-3 pos-rel rounded-t pt-2"
    :class="{
      'bg-orange-lighten-3': !appStore.darkMode,
      'bg-grey-darken-3': appStore.darkMode
    }"
  >
    <v-text-field
      class="pl-2 pr-3 text-white"
      hide-details
      v-model="props.column.name"
      :bg-color="appStore.darkMode ? 'grey-darken-3' : 'orange-lighten-3'"
      density="compact"
      flat
      @update:modelValue="(e: string) => updateColumnName(props.column.id, e)"
      variant="solo"
    >
      <template #append>
        <v-btn
          variant="text"
          size="small"
          color="white"
          icon
          :disabled="kanbanStore.loading || kanbanStore.interactionsDisabled"
        >
          <v-icon> mdi-dots-horizontal </v-icon>
          <v-menu activator="parent">
            <v-list
              border
              elevation="0"
              density="compact"
              class="actions_list py-0"
            >
              <v-list-item
                class="actions_list_item text-caption"
                v-for="(item, i) in columnActions"
                @click="handleColumnAction(item.type, props.column.id)"
                :key="i"
              >
                <span>
                  {{ item.text }}
                </span>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
      </template>
    </v-text-field>
  </div>
  <container
    tag="div"
    :class="{
      'pt-10': !props.column.cards.length,
      'bg-orange-lighten-3': !appStore.darkMode,
      'bg-grey-darken-3': appStore.darkMode
    }"
    class="kanban-column px-4 rounded-b py-2"
    :get-child-payload="getCardPayload(props.column.projectId, props.column.id)"
    orientation="vertical"
    :group-name="props.column.projectId.toString()"
    @drop="(result: DropResult<CardModel>) => onCardDrop(props.column.projectId, props.column.id, result)"
    drag-class="card-ghost"
    drop-class="card-ghost-drop"
    :drop-placeholder="dropPlaceholderOptions"
  >
    <draggable
      v-for="card in props.column.cards"
      :key="card.id"
    >
      <kanban-card
        v-if="card"
        @click.right.prevent="openCardMenu(card)"
        :data="card"
      >
        <v-menu
          transition="scale-transition"
          location="end"
          v-model="card.menuOpen"
          activator="parent"
        >
          <v-list
            border
            rounded="0"
            elevation="0"
            density="compact"
            class="actions_list py-0"
          >
            <v-list-item
              class="actions_list_item text-caption"
              v-for="(item, i) in cardActions"
              @click="handleCardAction(item.type, card, props.column.id)"
              :key="i"
            >
              <span>
                {{ item.text }}
              </span>
            </v-list-item>
          </v-list>
        </v-menu>
      </kanban-card>
    </draggable>
  </container>
  <div class="d-flex justify-center mt-3">
    <v-btn
      variant="outlined"
      color="orange"
      size="small"
      prepend-icon="mdi-plus"
      rounded="8"
      :disabled="kanbanStore.loading || kanbanStore.interactionsDisabled"
      @click="handleColumnAction(COLUMN_ACTIONS.CREATE_CARD, props.column.id)"
    >
      Add card
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { useConfirmationDialog } from "@/composables/useConfirmationDialog";
import {
  CARD_ACTIONS,
  cardActions,
  COLUMN_ACTIONS,
  columnActions,
  dropPlaceholderOptions
} from "@/constants/kanban";
import { applyDrag } from "@/helpers/kanban";
import { DropResult } from "@/models/common";
import { CardModel, ColumnModel, MovePosition } from "@/models/kanban";
import { useAppStore } from "@/store/app";
import { useKanbanStore } from "@/store/kanban";
import { useDebounceFn } from "@vueuse/core";
import { Container, Draggable } from "vue3-smooth-dnd";
import KanbanCard from "./KanbanCard.vue";

const kanbanStore = useKanbanStore();
const appStore = useAppStore();
const createConfirmationDialog = useConfirmationDialog();

const props = defineProps<{
  column: ColumnModel;
}>();

const getCardPayload = (projectId: number, columnId: number) => {
  return (index: number) => {
    const project = kanbanStore.projects.find((p) => p.id === projectId);
    return project?.columns.filter((p) => p.id === columnId)[0].cards[index];
  };
};

const handleColumnAction = async (action: string, columnId: number) => {
  if (kanbanStore.interactionsDisabled) return;
  switch (action) {
    case COLUMN_ACTIONS.DELETE:
      const answerDelete = await createConfirmationDialog();
      if (answerDelete) {
        const positions: MovePosition[] = [];
        const project = kanbanStore.projects.find((p) => p.id === kanbanStore.selectedProject);

        if (project) {
          const column = project.columns.find((c) => c.id === columnId);

          for (const c of project.columns) {
            if (c.id === columnId) continue;
            positions.push({
              id: c.id,
              newPosition: column!.position < c.position ? c.position - 1 : c.position
            });
          }

          await kanbanStore.deleteColumn(columnId, positions);
          project.columns = project.columns.filter((c) => c.id !== columnId);

          for (const position of positions) {
            const column = project.columns.find((c) => c.id === position.id);
            if (column) {
              column.position = position.newPosition;
            }
          }
        }
      }
      break;

    case COLUMN_ACTIONS.CREATE_CARD:
      kanbanStore.kanbanCardDialog = true;
      kanbanStore.activeColumnId = columnId;
      break;
    case COLUMN_ACTIONS.EXPORT:
      const project = kanbanStore.projects.find((p) => p.id === kanbanStore.selectedProject);
      const column = project!.columns.find((c) => c.id === columnId);
      let res = "";
      for (const card of column!.cards) {
        res += `${card.name} (${card.rating || 0}/5)\n`;
      }
      navigator.clipboard.writeText(res);
      break;
  }
};

const openCardMenu = (card: CardModel) => {
  kanbanStore.projects.forEach((p) => {
    p.columns.forEach((c) => {
      c.cards.forEach((card) => {
        card.menuOpen = false;
      });
    });
  });
  card.menuOpen = true;
};

const adjustColumnCardPositions = (column: ColumnModel, positions: MovePosition[]) => {
  for (const position of positions) {
    const card = column.cards.find((c) => c.id === position.id);
    card!.position = position.newPosition;
  }
};

const onCardDrop = async <T extends CardModel>(
  projectId: number,
  columnId: number,
  dropResult: DropResult<T>
) => {
  if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
    if (dropResult.addedIndex === dropResult.removedIndex) return;
    const project = kanbanStore.projects.find((p) => p.id === projectId);
    if (project) {
      const column = project.columns.filter((p) => p.id === columnId)[0];
      const itemIndex = project.columns.indexOf(column);
      const newColumn = Object.assign({}, column);
      newColumn.cards = applyDrag<CardModel>(newColumn.cards, dropResult);
      project.columns.splice(itemIndex, 1, newColumn);
      if (dropResult.addedIndex !== null && dropResult.removedIndex !== null) {
        // Rearrange in the same column
        const positions: MovePosition[] = newColumn.cards.map((c, i) => ({
          id: c.id,
          newPosition: i
        }));
        await kanbanStore.rearrangeCardsInColumn(positions);
        adjustColumnCardPositions(newColumn, positions);
      } else if (dropResult.addedIndex !== null) {
        // Moved to new column
        const oldColumnPositions: MovePosition[] = [];
        const newColumnPositions: MovePosition[] = newColumn.cards.map((c, i) => ({
          id: c.id,
          newPosition: i
        }));

        const oldCardPosition = dropResult.payload.position;
        const oldColumn = project.columns.find((p) => p.id === dropResult.payload.columnId);

        if (oldColumn) {
          for (const card of oldColumn.cards.filter((c) => c.id !== dropResult.payload.id)) {
            oldColumnPositions.push({
              id: card.id,
              newPosition: oldCardPosition < card.position ? card.position - 1 : card.position
            });
          }

          await kanbanStore.moveCardToColumn({
            cardId: dropResult.payload.id,
            positions: [...oldColumnPositions, ...newColumnPositions],
            newColumnId: columnId
          });

          const card = newColumn.cards.find((c) => c.id === dropResult.payload.id);
          card!.columnId = columnId;

          adjustColumnCardPositions(oldColumn, oldColumnPositions);
          adjustColumnCardPositions(newColumn, newColumnPositions);
        }
      }
    }
  }
};

const updateColumnName = useDebounceFn(async (columnId: number, value: string) => {
  if (value.length >= 3) {
    await kanbanStore.changeColumnName(columnId, value);
  }
}, 400);

const handleCardAction = async (action: string, card: CardModel, columnId: number) => {
  switch (action) {
    case CARD_ACTIONS.ADD_RATING:
      await kanbanStore.addRating(card.id);
      card.rating = 1;
      break;
    case CARD_ACTIONS.MARK_URGENT:
      await kanbanStore.markAsUrgent(card);
      card.urgent = !card.urgent;
      break;
    case CARD_ACTIONS.DELETE:
      const answerDelete = await createConfirmationDialog();
      if (answerDelete) {
        const positions: MovePosition[] = [];
        const project = kanbanStore.projects.find((p) => p.id === kanbanStore.selectedProject);
        const column = project!.columns.find((c) => c.id === columnId);

        for (const c of column!.cards) {
          if (c.id === card.id) continue;
          positions.push({
            id: c.id,
            newPosition: card.position < c.position ? c.position - 1 : c.position
          });
        }

        await kanbanStore.deleteCard(card.id, positions);
        column!.cards = column!.cards.filter((c) => c.id !== card.id);
        adjustColumnCardPositions(column!, positions);
      }
      break;
  }
};
</script>

<style scoped lang="scss">
.kanban-column {
  width: 300px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.actions_list {
  min-width: 150px;

  &_item {
    min-height: 20px;
  }
}

:deep(.v-list-item__content) {
  display: flex;
}

:deep(.v-field) {
  color: white !important;
}
</style>
