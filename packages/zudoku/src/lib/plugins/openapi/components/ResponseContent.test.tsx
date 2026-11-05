// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResponseContent } from "./ResponseContent.js";

const header = (name: string, schema: unknown, required = false) => ({
  name,
  description: null,
  required,
  schema,
});

describe("ResponseContent", () => {
  it("renders the headers of the selected response before its body", () => {
    render(
      <ResponseContent
        id="update-cargo"
        selectedResponse="200"
        responses={[
          {
            statusCode: "200",
            headers: [
              header("ETag", { type: "string" }),
              header("Location", { type: "string", format: "uri" }, true),
            ],
          },
          {
            statusCode: "412",
            headers: [header("X-Warp-Drift", { type: "integer" })],
          },
        ]}
      />,
    );

    const headersHeading = screen.getByRole("heading", { name: /^Headers/ });
    const bodyHeading = screen.getByRole("heading", { name: /^Body/ });
    expect(headersHeading).toHaveAttribute(
      "id",
      "update-cargo/responses/200/headers",
    );
    expect(bodyHeading).toHaveAttribute(
      "id",
      "update-cargo/responses/200/body",
    );
    expect(
      headersHeading.compareDocumentPosition(bodyHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("ETag")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("uri")).toBeInTheDocument();
    expect(screen.queryByText("X-Warp-Drift")).not.toBeInTheDocument();
  });

  it("only renders the body section when a response has no headers", () => {
    render(
      <ResponseContent
        id="update-cargo"
        selectedResponse="204"
        responses={[{ statusCode: "204", headers: [] }]}
      />,
    );

    expect(
      screen.queryByRole("heading", { name: /^Headers/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Body/ })).toBeInTheDocument();
    expect(screen.getByText("No data returned")).toBeInTheDocument();
  });

  it("shows header-level examples", () => {
    render(
      <ResponseContent
        id="update-cargo"
        selectedResponse="200"
        responses={[
          {
            statusCode: "200",
            headers: [
              {
                ...header("ETag", { type: "string" }),
                examples: [
                  {
                    name: "default",
                    value: "qe-7f3a9c",
                    hasValue: true,
                    summary: null,
                    description: null,
                    externalValue: null,
                  },
                ],
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("qe-7f3a9c")).toBeInTheDocument();
  });

  it("keeps the status tabs and headers for a const body schema", () => {
    render(
      <ResponseContent
        id="update-cargo"
        selectedResponse="200"
        responses={[
          {
            statusCode: "200",
            content: [
              {
                mediaType: "application/json",
                schema: { type: "string", const: "DOCKED" },
                examples: [],
              },
            ],
            headers: [header("ETag", { type: "string" })],
          },
          { statusCode: "404", headers: [] },
        ]}
      />,
    );

    expect(screen.getByRole("tab", { name: "404" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Headers/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("ETag")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Body/ })).toBeInTheDocument();
    expect(screen.getByText("DOCKED")).toBeInTheDocument();
  });
});
