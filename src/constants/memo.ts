export const MEMO_VISIBILITY = {
  PRIVATE: 1,
  PUBLIC: 2
};

export const memoVisibilityItems = [
  {
    title: "Private",
    value: MEMO_VISIBILITY.PRIVATE
  },
  {
    title: "Public",
    value: MEMO_VISIBILITY.PUBLIC
  }
];

export const MEMO_ACTIONS = {
  PIN: "pin",
  DELETE: "delete",
  ARCHIVE: "archive",
  EDIT: "edit",
  SHARE: "share"
};

export const memoActionItems = [
  {
    icon: "mdi-pin",
    text: "Pin",
    type: MEMO_ACTIONS.PIN,
    color: "grey"
  },
  {
    icon: "mdi-delete-outline",
    text: "Delete",
    type: MEMO_ACTIONS.DELETE,
    color: "red"
  },
  {
    icon: "mdi-archive-outline",
    text: "Archive",
    type: MEMO_ACTIONS.ARCHIVE,
    color: "orange"
  },
  {
    icon: "mdi-pencil",
    text: "Edit",
    type: MEMO_ACTIONS.EDIT,
    color: "grey"
  },
  {
    icon: "mdi-share",
    text: "Share",
    type: MEMO_ACTIONS.SHARE,
    color: "grey"
  }
];

export const MEMO_ADDITIONAL_ACTIONS = {
  PREVIEW: "preview",
  ADD_CODE_BLOCK: "addCodeBlock",
  ADD_CHECKLIST: "addChecklist"
};

export const memoAdditionalActionItems = [
  {
    icon: "mdi-pin",
    text: "Preview",
    type: MEMO_ADDITIONAL_ACTIONS.PREVIEW,
    color: "grey"
  },
  {
    icon: "mdi-delete-outline",
    text: "Add code block",
    type: MEMO_ADDITIONAL_ACTIONS.ADD_CODE_BLOCK,
    color: "red"
  },
  {
    icon: "mdi-archive-outline",
    text: "Add checklist",
    type: MEMO_ADDITIONAL_ACTIONS.ADD_CHECKLIST,
    color: "orange"
  }
];
