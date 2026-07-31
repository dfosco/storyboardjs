import { Button } from '@primer/react-brand'
import { IssueReopenedIcon } from '@primer/octicons-react'
import { useResetCanvas } from '@dfosco/tiny-canvas'

export function StateToggle() {
  const resetCanvas = useResetCanvas({ reload: true })

  return (
    <Button 
      variant="primary"
      leadingVisual={<IssueReopenedIcon/>} 
      onClick={resetCanvas}
      hasArrow={false}
    >
      Reset all changes
    </Button>
  )
}