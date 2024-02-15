import * as ReactScrollArea from '@radix-ui/react-scroll-area'
import "./ScrollArea.css"

function ScrollArea({children, height, width}) {
    return (
        <ReactScrollArea.Root className="ScrollAreaRoot" style={{height: height ?? "100%", width: width ?? '100%'}}>
            <ReactScrollArea.Viewport className="ScrollAreaViewport" style={{height: "100%"}}>
                {children}
            </ReactScrollArea.Viewport>
            <ReactScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="vertical">
                <ReactScrollArea.Thumb className="ScrollAreaThumb"/>
            </ReactScrollArea.Scrollbar>
            <ReactScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="horizontal">
                <ReactScrollArea.Thumb className="ScrollAreaThumb"/>
            </ReactScrollArea.Scrollbar>
            <ReactScrollArea.Corner className="ScrollAreaCorner"/>
        </ReactScrollArea.Root>
    )
}

export default ScrollArea