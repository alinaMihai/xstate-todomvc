import { Machine, assign, sendParent } from "xstate";
import { ToDoContext, TodoEvent, TodoStateSchema } from './types';
import { S, E } from './constants';

export const createTodoMachine = ({ id, title, completed }: { id: string, title: string, completed: boolean }) =>
	Machine<ToDoContext, TodoStateSchema, TodoEvent>(
		{
			id: "todo",
			initial: S.Reading,
			context: {
				id,
				title,
				prevTitle: title,
				completed,
			},
			on: {
				[E.TOGGLE_COMPLETE]: {
					actions: [assign({ completed: (context) => !context.completed }), "notifyChanged"],
				},
				[E.DELETE]: S.Deleted,
			},
			states: {
				[S.Reading]: {
					on: {
						[E.SET_ACTIVE]: {
							actions: [
								assign({ completed: (_) => false }),
								"notifyChanged"
							],
						},
						[E.SET_COMPLETED]: {
							actions: [
								assign({ completed: (_) => true }),
								"notifyChanged"
							],
						},
						[E.TOGGLE_COMPLETE]: {
							actions: [
								assign({ completed: (context) => !context.completed }),
								"notifyChanged",
							],
						},
						[E.EDIT]: {
							target: S.Editing,
							actions: "focusInput",
						},
					},
				},
				[S.Editing]: {
					entry: assign({ prevTitle: (ctx) => ctx.title }),
					on: {
						[E.CHANGE]: {
							actions: assign({
								title: (_, e) => e.value,
							}),
						},
						[E.COMMIT]: [
							{
								target: S.Reading,
								actions: "notifyChanged",
								cond: (ctx) => ctx.title.trim().length > 0,
							},
							{ target: S.Deleted },
						],
						[E.BLUR]: [
							{
								target: S.Reading,
								actions: "notifyChanged",
								cond: (ctx) => ctx.title.trim().length > 0
							},
							{
								target: S.Reading,
								actions: assign({ title: (ctx) => ctx.prevTitle })
							}
						],
						[E.CANCEL]: {
							target: S.Reading,
							actions: assign({ title: (ctx) => ctx.prevTitle }),
						},
					},
				},
				[S.Deleted]: {
					entry: "notifyDeleted",
				},
			},
		},
		{
			actions: {
				notifyChanged: sendParent((context) => ({
					type: E.TODO_COMMIT,
					todo: context,
				})),
				notifyDeleted: sendParent((context) => {
					return {
						type: E.TODO_DELETE,
						id: context.id,
					};
				}),
				focusInput: () => { },
			},
		}
	);
