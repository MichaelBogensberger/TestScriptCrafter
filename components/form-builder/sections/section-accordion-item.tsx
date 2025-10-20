"use client"

import { ReactNode } from "react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionAccordionItemProps {
  value: string
  title: string
  isComplete: boolean
  children: ReactNode
  className?: string
}

/**
 * Wiederverwendbare Accordion-Item-Komponente mit Status-Indikator
 * Korrigiert die Icon-Positionierung durch separates Layout
 */
export function SectionAccordionItem({ 
  value, 
  title, 
  isComplete, 
  children, 
  className 
}: SectionAccordionItemProps) {
  return (
    <AccordionItem value={value} className={cn("border-b", className)}>
      <AccordionTrigger className="text-lg font-medium hover:no-underline group">
        <div className="flex items-center justify-between w-full pr-4">
          <span className="text-left">{title}</span>
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-4 w-4 text-green-500 transition-colors" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500 transition-colors" />
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}
