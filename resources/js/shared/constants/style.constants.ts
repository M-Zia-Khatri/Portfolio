// export const customeSize = {
//     8.5: '54px',
//     10: "68px"
// } as const

export const HEADING = {
  h1: {
    size: { initial: '7', xs: '7', sm: '8', md: '8', lg: '9', xl: '9' },
  },
  h2: {
    size: { initial: '6', xs: '6', sm: '7', md: '7', lg: '8', xl: '8' },
  },
  h3: {
    size: { initial: '5', xs: '5', sm: '6', md: '6', lg: '7', xl: '7' },
  },
  h4: {
    size: { initial: '4', xs: '4', sm: '5', md: '5', lg: '6', xl: '6' },
  },
  h5: {
    size: { initial: '3', xs: '3', sm: '4', md: '4', lg: '5', xl: '5' },
  },
  h6: {
    size: { initial: '2', xs: '2', sm: '3', md: '3', lg: '4', xl: '4' },
  },
} as const;

export const TEXT = {
  sm: {
    size: { initial: '1', xs: '1', sm: '2', md: '2', lg: '2', xl: '3' },
  },
  base: {
    size: { initial: '2', xs: '2', sm: '3', md: '3', lg: '3', xl: '4' },
  },
  lg: {
    size: { initial: '3', xs: '3', sm: '4', md: '4', lg: '4', xl: '5' },
  },
} as const;
