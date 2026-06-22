import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  abbr: string
  term: string
  className?: string
}

export function Abbr({ abbr, term, className }: Props) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <abbr
          title={term}
          className={`cursor-help underline decoration-dotted underline-offset-2 decoration-muted-foreground/40 ${className ?? ''}`}
          tabIndex={-1}
        >
          {abbr}
        </abbr>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs px-2 py-1">
        {term}
      </TooltipContent>
    </Tooltip>
  )
}
