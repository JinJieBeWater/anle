import type { FormEvent } from "react";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Trash2 } from "lucide-react";
import { useLiveQuery } from "@tanstack/react-db";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { GuardBySync } from "@/components/powersync/guard-by-sync";
import { todoCollection } from "@/components/providers/system-provider";

export const Route = createFileRoute("/tanstack-db-todos")({
  component: TanstackDbTodosRoute,
});

function TanstackDbTodosRoute() {
  const [newTodoText, setNewTodoText] = useState("");
  const { data: todos, isLoading } = useLiveQuery((q) =>
    q.from({ todo: todoCollection }).orderBy(({ todo }) => todo.text, "asc"),
  );

  const handleAddTodo = async (e: FormEvent) => {
    e.preventDefault();
    const text = newTodoText.trim();
    if (!text) {
      return;
    }
    await todoCollection.insert({
      id: crypto.randomUUID(),
      text,
      completed: false,
    }).isPersisted.promise;
    setNewTodoText("");
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    await todoCollection.update(id, (draft) => {
      draft.completed = !completed;
    }).isPersisted.promise;
  };

  const handleDeleteTodo = async (id: string) => {
    await todoCollection.delete(id).isPersisted.promise;
  };

  const todoItems = todos ?? [];

  return (
    <GuardBySync>
      <div className="mx-auto w-full max-w-md py-10">
        <Card>
          <CardHeader>
            <CardTitle>TanStack DB Todos</CardTitle>
            <CardDescription>Live PowerSync collection with optimistic mutations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTodo} className="mb-6 flex items-center space-x-2">
              <Input
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a new task..."
              />
              <Button type="submit" disabled={!newTodoText.trim()}>
                Add
              </Button>
            </form>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : todoItems.length === 0 ? (
              <p className="py-4 text-center">No todos yet. Add one above!</p>
            ) : (
              <ul className="space-y-2">
                {todoItems.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                        id={`todo-${todo.id}`}
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`${todo.completed ? "line-through" : ""}`}
                      >
                        {todo.text}
                      </label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTodo(todo.id)}
                      aria-label="Delete todo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </GuardBySync>
  );
}
