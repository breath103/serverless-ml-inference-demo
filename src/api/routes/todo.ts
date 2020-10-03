import { Namespace, Parameter, PresenterRouteFactory, StandardError } from "@serverless-seoul/corgi";
import { Type } from "@serverless-seoul/typebox";

// Models
import { TodoItem, TodoList } from "../../models";

// Presenters
import * as Presenters from "../presenters";

async function findTodoList(id: string) {
  const todoList = await TodoList.primaryKey.get(id);
  if (!todoList) {
    throw new StandardError(404, { code: "NOT_FOUND", message: `List with id(${id}) not exists` });
  }
  return todoList;
}

export const route = new Namespace(
  "/ml-inference", {}, {
    children: [
      PresenterRouteFactory.GET(
        "", {
          desc: "list all todo lists", operationId: "listTodoLists"
        }, {
          after: Parameter.Query(Type.Optional(Type.String())),
        }, Presenters.TodoListList, async function() {
          const exclusiveStartKey = this.params.after ? JSON.parse(this.params.after) : undefined;
          const { records, lastEvaluatedKey } = await TodoList.primaryKey.scan({ limit: 10, exclusiveStartKey });

          return {
            data: records,
            paging: {
              after: lastEvaluatedKey && JSON.stringify(lastEvaluatedKey),
            }
          };
        }),
    ]
  });
