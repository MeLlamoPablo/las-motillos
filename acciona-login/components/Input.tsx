import styled from "styled-components";

export const Input = styled.input`
  background: var(--primary-bg-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  outline: none;
  padding: 0.4rem 0.6rem;

  :focus {
    border-color: var(--primary-color);
  }
`;
