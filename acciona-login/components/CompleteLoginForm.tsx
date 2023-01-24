import styled from "styled-components";
import { Content as PanelContent, Panel } from "./Panel";
import type { ComponentProps, ComponentType, HTMLProps } from "react";
import { Input } from "./Input";
import { Button } from "./Button";

const Form = styled(Panel).attrs({ forwardedAs: "form" })`
  margin: 0 2rem;

  display: flex;
  flex: 1;
  flex-direction: column;

  ${PanelContent} {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 400px) {
    margin-bottom: 20vh;
  }
` as ComponentType<HTMLProps<HTMLFormElement> & ComponentProps<typeof Panel>>;

const CodeSent = styled.p`
  margin: 0;
  font-size: 0.9em;
  color: var(--secondary-color);
`;

export const CompleteLoginForm = ({
  maskedPhoneNumber,
  onComplete,
}: {
  maskedPhoneNumber: string;
  onComplete: (params: { code: string }) => void;
}) => {
  return (
    <Form
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "350px",
        gap: "0.2rem",
      }}
      onSubmit={(e) => {
        e.preventDefault();

        if (
          e.target instanceof HTMLFormElement &&
          e.target["code"] instanceof HTMLInputElement
        ) {
          onComplete({
            code: e.target["code"].value,
          });
        }
      }}
      heading="Enter the code"
    >
      <CodeSent>
        <>We sent a code to {maskedPhoneNumber}:</>
      </CodeSent>

      <Input type="text" name="code" placeholder="123456" required={true} />

      <Button type="submit">Continue</Button>
    </Form>
  );
};
