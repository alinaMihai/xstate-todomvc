import { createMachine, assign, sendParent } from "xstate";

export const createTodoMachine = ({ id, title, completed }) =>
	createMachine(
		{
			id: "todo",
			initial: "reading",
			context: {
				id,
				title,
				prevTitle: title,
				completed,
			},
			on: {
				TOGGLE_COMPLETE: {
					actions: [assign({ completed: true }), "notifyChanged"],
				},
				DELETE: "deleted",
			},
			states: {
				reading: {
					on: {
						SET_ACTIVE: {
							actions: [assign({ completed: false }), "notifyChanged"],
						},
						SET_COMPLETED: {
							actions: [assign({ completed: true }), "notifyChanged"],
						},
						TOGGLE_COMPLETE: {
							actions: [
								assign({ completed: (context) => !context.completed }),
								"notifyChanged",
							],
						},
						EDIT: {
							target: "editing",
							actions: "focusInput",
						},
					},
				},
				editing: {
					entry: assign({ prevTitle: (ctx) => ctx.title }),
					on: {
						CHANGE: {
							actions: assign({
								title: (ctx, e) => e.value,
							}),
						},
						COMMIT: [
							{
								target: "reading",
								actions: "notifyChanged",
								cond: (ctx) => ctx.title.trim().length > 0,
							},
							{ target: "deleted" },
						],
						BLUR: {
							target: "reading",
							actions: "notifyChanged",
						},
						CANCEL: {
							target: "reading",
							actions: assign({ title: (ctx) => ctx.prevTitle }),
						},
					},
				},
				deleted: {
					entry: "notifyDeleted",
				},
			},
		},
		{
			actions: {
				notifyChanged: sendParent((context) => ({
					type: "TODO.COMMIT",
					todo: context,
				})),
				notifyDeleted: sendParent((context) => {
					return {
						type: "TODO.DELETE",
						id: context.id,
					};
				}),
				focusInput: () => {},
			},
		}
	);
