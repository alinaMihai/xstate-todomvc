export enum S {
    Reading = "reading",
    Deleted = "deleted",
    Editing = "editing",
    Loading = "loading",
    Persist = "persist",
    Ready = "ready"
};

export enum E {
    SET_ACTIVE = "SET_ACTIVE",
    SET_COMPLETED = "SET_COMPLETED",
    TOGGLE_COMPLETE = "TOGGLE_COMPLETE",
    EDIT = "EDIT",
    DELETE = "DELETE",
    CHANGE = "CHANGE",
    COMMIT = "COMMIT",
    BLUR = "BLUR",
    CANCEL = "CANCEL",
    NEWTODO_CHANGE = "NEWTODO.CHANGE",
    NEWTODO_COMMIT = "NEWTODO.COMMIT",
    TODO_COMMIT = "TODO.COMMIT",
    TODO_DELETE = "TODO.DELETE",
    SHOW = "SHOW",
    MARK_COMPLETED = "MARK.completed",
    MARK_ACTIVE = "MARK.active",
    CLEAR_COMPLETED = "CLEAR_COMPLETED"
}