import { Machine, actions, spawn } from "xstate";
import { v4 as uuid } from "uuid";
import { createTodoMachine } from "./todoMachine";
import { ToDosContext, ToDosEvent, TodosStateSchema } from "./types";
import { S, E } from './constants';
const { assign } = actions;

const createTodo = (title: string) => {
	return {
		id: uuid(),
		title: title,
		prevTitle: title,
		completed: false,
	};
};

export const todosMachine = Machine<ToDosContext, TodosStateSchema, ToDosEvent>({
	id: "todos",
	context: {
		todo: "", // new todo
		todos: [],
		filter: "all",
	},
	initial: S.Loading,
	states: {
		[S.Loading]: {
			entry: assign({
				todos: (context) => {
					// "Rehydrate" persisted todos
					return context.todos.map((todo) => ({
						...todo,
						ref: spawn(createTodoMachine(todo)),
					}));
				},
			}),
			always: S.Ready,
		},
		ready: {},
	},
	on: {
		[E.NEWTODO_CHANGE]: {
			actions: assign({
				todo: (_, e) => e.value,
			}),
		},
		[E.NEWTODO_COMMIT]: {
			actions: [
				assign({
					todo: (_) => "", // clear todo
					todos: (context, event) => {
						const newTodo = createTodo(event.value.trim());
						return context.todos.concat({
							...newTodo,
							ref: spawn(createTodoMachine(newTodo)),
						});
					},
				}),
				"persist",
			],
			cond: (_, e) => e.value.trim().length > 0,
		},
		[E.TODO_COMMIT]: {
			actions: [
				assign({
					todos: (ctx, e) =>
						ctx.todos.map((todo) =>
							todo.id === e.todo.id
								? { ...todo, ...e.todo, ref: todo.ref }
								: todo
						),
				}),
				"persist",
			],
		},
		[E.TODO_DELETE]: {
			actions: [
				assign({
					todos: (ctx, e) => {
						return ctx.todos.filter((todo) => todo.id !== e.id);
					},
				}),
				"persist",
			],
		},
		[E.SHOW]: {
			actions: assign({
				filter: (_, event) => event.filter,
			}),
		},
		[E.MARK_COMPLETED]: {
			actions: (ctx) => ctx.todos.forEach((todo) => todo.ref.send({ type: E.SET_COMPLETED })),
		},
		[E.MARK_ACTIVE]: {
			actions: (ctx) => ctx.todos.forEach((todo) => todo.ref.send({ type: E.SET_ACTIVE })),
		},
		[E.CLEAR_COMPLETED]: {
			actions: [
				assign({
					todos: (ctx) => ctx.todos.filter((todo) => !todo.completed),
				}),
				'persist',
			]
		},
	},
});
