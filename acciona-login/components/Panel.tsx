import styled from "styled-components";
import type { ReactNode } from "react";

const Container = styled.div`
  max-width: 370px;

  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.2rem;

  background: var(--primary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
`;

const Heading = styled.h1`
  background: var(--accent-color);
  color: var(--primary-color-dark);
  font-size: 1.2em;
  margin: 0;
  padding: 1rem 2rem;
  text-align: center;
`;

export const Content = styled.div`
  padding: 1rem 2rem 2rem;
`;

export const Panel = ({
  children,
  heading,
  ...props
}: {
  children: ReactNode | ReactNode[];
  heading: string;
}) => {
  return (
    <Container {...props}>
      <Heading>{heading}</Heading>
      <Content>{children}</Content>
    </Container>
  );
};
