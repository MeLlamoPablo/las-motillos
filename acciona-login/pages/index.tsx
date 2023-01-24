import { getRecaptchaSiteKey } from "@las-motillos/acciona-client";
import { useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { StatusCodes } from "http-status-codes";

import { CompleteLoginForm } from "$components/CompleteLoginForm";
import { StartLoginForm } from "$components/StartLoginForm";
import styled from "styled-components";
import { parse, stringify } from "query-string";

async function startLogin(payload: {
  email: string;
  password: string;
  recaptchaToken: string;
}): Promise<VerificationInfo> {
  const response = await fetch("/api/start-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === StatusCodes.OK) {
    return await response.json();
  }

  throw new Error("Login failed");
}

async function completeLogin(payload: {
  code: string;
  sessionInfo: string;
}): Promise<{ code: string }> {
  const response = await fetch("/api/complete-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === StatusCodes.OK) {
    return await response.json();
  }

  throw new Error("Login failed");
}

type VerificationInfo = {
  maskedPhoneNumber: string;
  sessionInfo: string;
};

const Main = styled.main`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Home({
  recaptchaSiteKey,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [verificationInfo, setVerificationInfo] =
    useState<VerificationInfo | null>(null);

  return (
    <Main>
      {verificationInfo ? (
        <CompleteLoginForm
          onComplete={({ code }) => {
            const { redirect_uri, state } = parse(window.location.search);

            if (typeof redirect_uri !== "string" || typeof state !== "string") {
              return;
            }

            completeLogin({
              code,
              sessionInfo: verificationInfo.sessionInfo,
            })
              .then(({ code }) => {
                window.location.href =
                  redirect_uri +
                  "?" +
                  stringify({
                    code,
                    state,
                  });
              })
              .catch(console.error);
          }}
          maskedPhoneNumber={verificationInfo.maskedPhoneNumber}
        />
      ) : (
        <StartLoginForm
          onLogin={({ email, password, recaptchaToken }) => {
            startLogin({
              email,
              password,
              recaptchaToken,
            })
              .then(setVerificationInfo)
              .catch(console.error);
          }}
          recaptchaSiteKey={recaptchaSiteKey}
        />
      )}
    </Main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      recaptchaSiteKey: await getRecaptchaSiteKey(),
    },
  };
};
