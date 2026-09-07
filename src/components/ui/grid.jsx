import * as React from "react"
import { cn } from "@/lib/utils"

const COLS_MAP = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
}

const SM_COLS_MAP = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  7: "sm:grid-cols-7",
  8: "sm:grid-cols-8",
  9: "sm:grid-cols-9",
  10: "sm:grid-cols-10",
  11: "sm:grid-cols-11",
  12: "sm:grid-cols-12",
}

const MD_COLS_MAP = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
  8: "md:grid-cols-8",
  9: "md:grid-cols-9",
  10: "md:grid-cols-10",
  11: "md:grid-cols-11",
  12: "md:grid-cols-12",
}

const LG_COLS_MAP = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
  9: "lg:grid-cols-9",
  10: "lg:grid-cols-10",
  11: "lg:grid-cols-11",
  12: "lg:grid-cols-12",
}

const XL_COLS_MAP = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
  7: "xl:grid-cols-7",
  8: "xl:grid-cols-8",
  9: "xl:grid-cols-9",
  10: "xl:grid-cols-10",
  11: "xl:grid-cols-11",
  12: "xl:grid-cols-12",
}

const SPAN_MAP = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
  full: "col-span-full",
}

const SM_SPAN_MAP = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
  9: "sm:col-span-9",
  10: "sm:col-span-10",
  11: "sm:col-span-11",
  12: "sm:col-span-12",
  full: "sm:col-span-full",
}

const MD_SPAN_MAP = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
  full: "md:col-span-full",
}

const LG_SPAN_MAP = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
  full: "lg:col-span-full",
}

const XL_SPAN_MAP = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
  full: "xl:col-span-full",
}

const GAP_MAP = {
  0: "gap-0",
  1: "gap-1",
  1.5: "gap-1.5",
  2: "gap-2",
  2.5: "gap-2.5",
  3: "gap-3",
  3.5: "gap-3.5",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
}

const GAP_X_MAP = {
  0: "gap-x-0",
  1: "gap-x-1",
  1.5: "gap-x-1.5",
  2: "gap-x-2",
  2.5: "gap-x-2.5",
  3: "gap-x-3",
  3.5: "gap-x-3.5",
  4: "gap-x-4",
  5: "gap-x-5",
  6: "gap-x-6",
  8: "gap-x-8",
  10: "gap-x-10",
  12: "gap-x-12",
}

const GAP_Y_MAP = {
  0: "gap-y-0",
  1: "gap-y-1",
  1.5: "gap-y-1.5",
  2: "gap-y-2",
  2.5: "gap-y-2.5",
  3: "gap-y-3",
  3.5: "gap-y-3.5",
  4: "gap-y-4",
  5: "gap-y-5",
  6: "gap-y-6",
  8: "gap-y-8",
  10: "gap-y-10",
  12: "gap-y-12",
}

/**
 * Grid Component
 * @example
 * <Grid cols={4} gap={3}>...</Grid>
 * <Grid cols={{ default: 1, sm: 2, lg: 4 }} gap={3}>...</Grid>
 * <Grid minWidth="220px" gap={3}>...</Grid>
 */
function Grid({
  as: Component = "div",
  cols = 1,
  gap,
  gapX,
  gapY,
  minWidth,
  autoFit,
  container = false,
  className,
  style,
  children,
  ...props
}) {
  const minW = minWidth || autoFit

  // Resolve responsive columns classes
  const colsClasses = React.useMemo(() => {
    if (minW) return ""

    if (typeof cols === "number" || typeof cols === "string") {
      return COLS_MAP[cols] || `grid-cols-${cols}`
    }

    if (typeof cols === "object" && cols !== null) {
      const classes = []
      if (cols.default || cols.base || cols.xs) {
        const val = cols.default || cols.base || cols.xs
        classes.push(COLS_MAP[val] || `grid-cols-${val}`)
      }
      if (cols.sm) classes.push(SM_COLS_MAP[cols.sm] || `sm:grid-cols-${cols.sm}`)
      if (cols.md) classes.push(MD_COLS_MAP[cols.md] || `md:grid-cols-${cols.md}`)
      if (cols.lg) classes.push(LG_COLS_MAP[cols.lg] || `lg:grid-cols-${cols.lg}`)
      if (cols.xl) classes.push(XL_COLS_MAP[cols.xl] || `xl:grid-cols-${cols.xl}`)
      return classes.join(" ")
    }

    return "grid-cols-1"
  }, [cols, minW])

  // Resolve gaps
  const gapClass = gap !== undefined ? (GAP_MAP[gap] || `gap-[${gap}]`) : ""
  const gapXClass = gapX !== undefined ? (GAP_X_MAP[gapX] || `gap-x-[${gapX}]`) : ""
  const gapYClass = gapY !== undefined ? (GAP_Y_MAP[gapY] || `gap-y-[${gapY}]`) : ""

  const autoStyle = minW
    ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(${typeof minW === "number" ? `${minW}px` : minW}, 1fr))`,
        ...style,
      }
    : style

  return (
    <Component
      className={cn(
        "grid",
        container && "@container",
        colsClasses,
        gapClass,
        gapXClass,
        gapYClass,
        className
      )}
      style={autoStyle}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * Col / GridItem Component
 * @example
 * <Col span={2}>...</Col>
 * <Col span={{ default: 1, sm: 2, lg: 3 }}>...</Col>
 */
function Col({
  as: Component = "div",
  span = 1,
  start,
  rowSpan,
  className,
  children,
  ...props
}) {
  const spanClasses = React.useMemo(() => {
    if (typeof span === "number" || typeof span === "string") {
      return SPAN_MAP[span] || `col-span-${span}`
    }

    if (typeof span === "object" && span !== null) {
      const classes = []
      if (span.default || span.base || span.xs) {
        const val = span.default || span.base || span.xs
        classes.push(SPAN_MAP[val] || `col-span-${val}`)
      }
      if (span.sm) classes.push(SM_SPAN_MAP[span.sm] || `sm:col-span-${span.sm}`)
      if (span.md) classes.push(MD_SPAN_MAP[span.md] || `md:col-span-${span.md}`)
      if (span.lg) classes.push(LG_SPAN_MAP[span.lg] || `lg:col-span-${span.lg}`)
      if (span.xl) classes.push(XL_SPAN_MAP[span.xl] || `xl:col-span-${span.xl}`)
      return classes.join(" ")
    }

    return "col-span-1"
  }, [span])

  const startClass = start ? `col-start-${start}` : ""
  const rowSpanClass = rowSpan ? (rowSpan === "full" ? "row-span-full" : `row-span-${rowSpan}`) : ""

  return (
    <Component
      className={cn(spanClasses, startClass, rowSpanClass, className)}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * Stack Component (Flex Vertical Column)
 * @example
 * <Stack gap={3}>...</Stack>
 */
function Stack({
  as: Component = "div",
  gap = 3,
  align = "stretch",
  justify = "start",
  className,
  children,
  ...props
}) {
  const gapClass = GAP_MAP[gap] || `gap-[${gap}]`
  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  }[align] || "items-stretch"

  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  }[justify] || "justify-start"

  return (
    <Component
      className={cn("flex flex-col", gapClass, alignClass, justifyClass, className)}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * Flex Component (Flex Horizontal/Custom)
 * @example
 * <Flex align="center" justify="between" gap={2}>...</Flex>
 */
function Flex({
  as: Component = "div",
  gap = 2,
  align = "center",
  justify = "start",
  wrap = false,
  direction = "row",
  className,
  children,
  ...props
}) {
  const gapClass = GAP_MAP[gap] || `gap-[${gap}]`
  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  }[align] || "items-center"

  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  }[justify] || "justify-start"

  const dirClass = direction === "col" ? "flex-col" : "flex-row"
  const wrapClass = wrap ? "flex-wrap" : "flex-nowrap"

  return (
    <Component
      className={cn("flex", dirClass, wrapClass, gapClass, alignClass, justifyClass, className)}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * Row Component (Flex Horizontal Row)
 * @example
 * <Row gap={3} align="center" justify="between">...</Row>
 * <Row wrap gap={3}>
 *   <div className="flex-1">...</div>
 * </Row>
 */
function Row({
  as: Component = "div",
  gap = 2,
  gapX,
  gapY,
  align = "center",
  justify = "start",
  wrap = true,
  className,
  children,
  ...props
}) {
  const gapClass = gap !== undefined ? (GAP_MAP[gap] || `gap-[${gap}]`) : ""
  const gapXClass = gapX !== undefined ? (GAP_X_MAP[gapX] || `gap-x-[${gapX}]`) : ""
  const gapYClass = gapY !== undefined ? (GAP_Y_MAP[gapY] || `gap-y-[${gapY}]`) : ""

  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  }[align] || "items-center"

  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  }[justify] || "justify-start"

  const wrapClass = wrap ? "flex-wrap" : "flex-nowrap"

  return (
    <Component
      className={cn(
        "flex flex-row",
        wrapClass,
        gapClass,
        gapXClass,
        gapYClass,
        alignClass,
        justifyClass,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export { Grid, Col, Col as GridItem, Row, Stack, Flex }
