export const PRESETS = {
  "유치부": {
    approver1: { id: "user_id_placeholder_1", name: "유치부장" },
    approver2: { id: "user_id_placeholder_3", name: "교장" },
  },
  "초등부": {
    approver1: { id: "user_id_placeholder_2", name: "초등부장" },
    approver2: { id: "user_id_placeholder_3", name: "교장" },
  },
  "행정실": {
    approver1: { id: "user_id_placeholder_2", name: "행정부장" },
    approver2: { id: "user_id_placeholder_4", name: "교장 전결" },
  }
};

export const DEPARTMENTS = Object.keys(PRESETS);
