import styled from "styled-components";

export const Button = styled.button`
  align-self: flex-end;
  appearance: none;
  background: var(--accent-color);
  border-radius: calc(var(--border-radius) / 2);
  border: 0;
  color: var(--primary-color-dark);
  cursor: pointer;
  padding: 0.5rem 1rem;
  width: fit-content;

  :active,
  :hover {
    opacity: 0.9;
  }
`;
