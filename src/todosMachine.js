import { createMachine, actions, spawn } from "xstate";
import uuid from "uuid-v4";
import { createTodoMachine } from "./todoMachine";
const { assign } = actions;

const createTodo = (title) => {
	return {
		id: uuid(),
		title: title,
		completed: false,
	};
};

export const todosMachine = createMachine({
	id: "todos",
	context: {
		todo: "", // new todo
		todos: [],
		filter: "all",
	},
	initial: "loading",
	states: {
		loading: {
			entry: assign({
				todos: (context) => {
					// "Rehydrate" persisted todos
					return context.todos.map((todo) => ({
						...todo,
						ref: spawn(createTodoMachine(todo)),
					}));
				},
			}),
			always: "ready",
		},
		ready: {},
	},
	on: {
		"NEWTODO.CHANGE": {
			actions: assign({
				todo: (ctx, e) => e.value,
			}),
		},
		"NEWTODO.COMMIT": {
			actions: [
				assign({
					todo: "", // clear todo
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
			cond: (ctx, e) => e.value.trim().length,
		},
		"TODO.COMMIT": {
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
		"TODO.DELETE": {
			actions: [
				assign({
					todos: (ctx, e) => {
						return ctx.todos.filter((todo) => todo.id !== e.id);
					},
				}),
				"persist",
			],
		},
		SHOW: {
			actions: assign({
				filter: (_, event) => event.filter,
			}),
		},
		"MARK.completed": {
			actions: (ctx) => ctx.todos.forEach((todo) => todo.ref.send("SET_COMPLETED")),
		},
		"MARK.active": {
			actions: (ctx) => ctx.todos.forEach((todo) => todo.ref.send("SET_ACTIVE")),
		},
		CLEAR_COMPLETED: {
			actions: assign({
				todos: (ctx) => ctx.todos.filter((todo) => !todo.completed),
			}),
		},
	},
});
