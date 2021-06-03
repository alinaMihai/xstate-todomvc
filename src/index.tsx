import ReactDOM from "react-dom";
import { inspect } from "@xstate/inspect";
inspect({
  url: "https://statecharts.io/inspect",
  iframe: false
});

import "todomvc-app-css/index.css";

import { Todos } from "./Todos";


ReactDOM.render(<Todos />, document.querySelector("#app"));