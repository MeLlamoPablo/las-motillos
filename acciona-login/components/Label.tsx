import styled from "styled-components";

export const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--secondary-color);

  :focus-within {
    color: var(--primary-color);
  }
`;
