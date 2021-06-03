import React, { useEffect, useRef } from "react";
import { useActor } from "@xstate/react";
import cn from "classnames";
import { S, E } from './constants';
import { ToDoContext, TodoEvent, TodosStateSchema } from "./types";
import { Interpreter } from "xstate";

type ToDoActor = Interpreter<ToDoContext, TodosStateSchema, TodoEvent>;

export const Todo: React.FC<{ todoRef: ToDoActor }> = ({ todoRef }) => {
  const inputRef = useRef<any>(null);
  // the ToDoActor type doesn't correctly set the send type
  const [state, send]: any = useActor<ToDoActor>(todoRef);
  const { id, completed, title } = state.context;

  useEffect(
    () => {
      if (state.actions.find((action: any) => action.type === 'focusInput')) {
        inputRef?.current?.select();
      }
    },
    [state.actions, todoRef]
  );


  return (
    <li
      className={cn({
        editing: state.matches(S.Editing),
        completed: completed
      })}
      data-todo-state={completed ? "completed" : "active"}
      key={id}
    >
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          onChange={_ => {
            send({ type: E.TOGGLE_COMPLETE });
          }}
          value={completed}
          checked={completed}
        />
        <label
          onDoubleClick={() => {
            send({ type: E.EDIT });
          }}
        >
          {title}
        </label>{" "}
        <button className="destroy" onClick={() => send({ type: E.DELETE })} />
      </div>
      <input
        className="edit"
        value={title}
        onBlur={_ => send({ type: E.BLUR })}
        onChange={e => send({ type: E.CHANGE, value: e.target.value })}
        onKeyPress={e => {
          if (e.key === "Enter") {
            send({ type: E.COMMIT });
          }
        }}
        onKeyDown={e => {
          if (e.key === "Escape") {
            send({ type: E.CANCEL });
          }
        }}
        ref={inputRef}
      />
    </li>
  );
}
