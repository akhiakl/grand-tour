import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "@/components/ui/input";

import { ListEditor } from "./list-editor";

describe("ListEditor", () => {
  it("renders one row per item and the current count", () => {
    const onChange = vi.fn();
    render(
      <ListEditor
        label="Tips"
        items={["Book early", "Bring cash"]}
        max={6}
        newItem={() => ""}
        onChange={onChange}
        renderRow={(item, change) => (
          <Input value={item} onChange={(e) => change(e.target.value)} />
        )}
      />,
    );

    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(screen.getByText("2/6")).toBeInTheDocument();
  });

  it("appends a new item via the add button", async () => {
    const onChange = vi.fn();
    render(
      <ListEditor
        label="Tips"
        items={["Book early"]}
        max={6}
        addLabel="Add tip"
        newItem={() => "new"}
        onChange={onChange}
        renderRow={(item, change) => (
          <Input value={item} onChange={(e) => change(e.target.value)} />
        )}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Add tip" }));
    expect(onChange).toHaveBeenCalledWith(["Book early", "new"]);
  });

  it("removes a row without touching the others", async () => {
    const onChange = vi.fn();
    render(
      <ListEditor
        label="Tips"
        items={["First", "Second"]}
        max={6}
        newItem={() => ""}
        onChange={onChange}
        renderRow={(item, change) => (
          <Input value={item} onChange={(e) => change(e.target.value)} />
        )}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Remove tips 1" }));
    expect(onChange).toHaveBeenCalledWith(["Second"]);
  });

  it("hides the add button once at max", () => {
    render(
      <ListEditor
        label="Tips"
        items={["a", "b"]}
        max={2}
        newItem={() => ""}
        onChange={vi.fn()}
        renderRow={(item, change) => (
          <Input value={item} onChange={(e) => change(e.target.value)} />
        )}
      />,
    );

    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
  });
});
