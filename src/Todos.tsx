import React, { useEffect } from "react";
import cn from "classnames";
import "todomvc-app-css/index.css";
import { useMachine } from "@xstate/react";
import { useHashChange } from "./useHashChange";
import { Todo } from "./Todo";
import { todosMachine } from "./todosMachine";
import { E } from "./constants";
import { todo } from "./types";

function filterTodos(filter: string, todos: todo[]) {
  if (filter === "active") {
    return todos.filter(todo => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter(todo => todo.completed);
  }
  return todos;
}

const persistedTodosMachine = todosMachine.withConfig(
  {
    actions: {
      persist: ctx => {
        try {
          localStorage.setItem("todos-xstate", JSON.stringify(ctx.todos));
        } catch (e) {
          console.error(e);
        }
      }
    }
  },
  // initial state from localstorage
  {
    todo: "Learn state machines",
    filter: "all",
    todos: (() => {
      try {
        const todos = localStorage.getItem("todos-xstate") || "";
        return JSON.parse(todos);
      } catch (e) {
        return [];
      }
    })()
  }
);

export function Todos() {
  const [state, send] = useMachine(persistedTodosMachine);

  useHashChange(() => {
    send({ type: E.SHOW, filter: window.location.hash.slice(2) || "all" });
  });

  // Capture initial state of browser hash
  useEffect(() => {
    window.location.hash.slice(2) &&
      send({ type: E.SHOW, filter: window.location.hash.slice(2) });
  }, [send]);

  const { todos, todo, filter } = state.context;

  const numActiveTodos = todos.filter(todo => !todo.completed).length;
  const allCompleted = todos.length > 0 && numActiveTodos === 0;
  const mark = !allCompleted ? "completed" : "active";
  const markEvent = mark === 'completed' ? E.MARK_COMPLETED : E.MARK_ACTIVE;
  const filteredTodos = filterTodos(filter, todos);

  return (
    <section className="todoapp" data-state={state.toStrings()}>
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          autoFocus
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
            if (e.key === "Enter") {
              send({ type: E.NEWTODO_COMMIT, value: e.target.value });
            }
          }}
          onChange={e =>
            send({
              type: E.NEWTODO_CHANGE,
              value: e.target.value
            })
          }
          value={todo}
        />
      </header>
      <section className="main">
        <input
          id="toggle-all"
          className="toggle-all"
          type="checkbox"
          checked={allCompleted}
          onChange={() => {
            send(markEvent);
          }}
        />
        <label htmlFor="toggle-all" title={`Mark all as ${mark}`}>
          Mark all as {mark}
        </label>
        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <Todo
              key={todo.id}
              todoRef={todo.ref}
            />
          ))}
        </ul>
      </section>
      {!!todos.length && (
        <footer className="footer">
          <span className="todo-count">
            <strong>{numActiveTodos}</strong> item
            {numActiveTodos === 1 ? "" : "s"} left
          </span>
          <ul className="filters">
            <li>
              <a
                className={cn({
                  selected: state.matches("all")
                })}
                href="#/"
              >
                All
              </a>
            </li>
            <li>
              <a
                className={cn({
                  selected: state.matches("active")
                })}
                href="#/active"
              >
                Active
              </a>
            </li>
            <li>
              <a
                className={cn({
                  selected: state.matches("completed")
                })}
                href="#/completed"
              >
                Completed
              </a>
            </li>
          </ul>
          {numActiveTodos < todos.length && (
            <button
              onClick={_ => send({ type: E.CLEAR_COMPLETED })}
              className="clear-completed"
            >
              Clear completed
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
