import ReCAPTCHA from "react-google-recaptcha";
import { ComponentProps, ComponentType, HTMLProps, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import styled from "styled-components";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import { Panel, Content as PanelContent } from "./Panel";

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

const Fields = styled.fieldset`
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
`;

const ReCaptchaContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const StartLoginForm = ({
  onLogin,
  recaptchaSiteKey,
}: {
  onLogin: (params: {
    email: string;
    password: string;
    recaptchaToken: string;
  }) => void;
  recaptchaSiteKey: string;
}) => {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const isMobile = useMediaQuery("(max-width: 400px)");

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();

        if (
          recaptchaToken &&
          e.target instanceof HTMLFormElement &&
          e.target["email"] instanceof HTMLInputElement &&
          e.target["password"] instanceof HTMLInputElement
        ) {
          onLogin({
            email: e.target["email"].value,
            password: e.target["password"].value,
            recaptchaToken,
          });
        }
      }}
      heading="Inicia sesión con Acciona"
    >
      <Fields>
        <Label htmlFor="email">
          Email
          <Input type="email" name="email" required={true} />
        </Label>
        <Label htmlFor="email">
          Password
          <Input type="password" name="password" required={true} />
        </Label>
      </Fields>

      <ReCaptchaContainer>
        <ReCAPTCHA
          onChange={setRecaptchaToken}
          sitekey={recaptchaSiteKey}
          size={isMobile ? "compact" : "normal"}
          theme={isDarkMode ? "dark" : "light"}
        />
      </ReCaptchaContainer>

      <Button type="submit" disabled={!recaptchaToken}>
        Login
      </Button>
    </Form>
  );
};
