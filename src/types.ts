import { S, E } from './constants';

export type ToDoContext = {
    id: string,
    title: string,
    prevTitle: string,
    completed: boolean
}
export type todo = ToDoContext & {ref: any};
export type ToDosContext = {
    todo: string,
    todos: todo[],
    filter: string
};

export interface TodoStateSchema {
    states: {
        [S.Reading]: {},
        [S.Editing]: {},
        [S.Deleted]: {}
    }
}

export interface TodosStateSchema {
    states: {
        [S.Loading]: {},
        [S.Ready]: {}
    }
}

export type TodoEvent =
    | { type: E.SET_ACTIVE }
    | { type: E.SET_COMPLETED }
    | { type: E.TOGGLE_COMPLETE }
    | { type: E.EDIT }
    | { type: E.DELETE }
    | { type: E.CANCEL }
    | { type: E.CHANGE, value: string }
    | { type: E.COMMIT }
    | { type: E.BLUR };

export type ToDosEvent =
    | { type: E.NEWTODO_CHANGE, value: string }
    | { type: E.NEWTODO_COMMIT, value: string }
    | { type: E.TODO_COMMIT, todo: ToDoContext }
    | { type: E.TODO_DELETE, id: string }
    | { type: E.SHOW, filter: string }
    | { type: E.MARK_COMPLETED }
    | { type: E.MARK_ACTIVE }
    | { type: E.CLEAR_COMPLETED }
