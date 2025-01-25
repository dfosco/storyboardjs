import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import './styles.css';
import './draggable.css';


function App() {
  const nodeRef = useRef(null);
  return (
    <main>
      <div className="canvas">
        <Draggable
          nodeRef={nodeRef}
          handle=".draggable"
          position={null}
          grid={[40, 40]}
          bounds=".canvas"
          offsetParent=""
          scale={1}>
          <div className="draggable" style={{ border: '1px solid #999', padding: '20px' }} ref={nodeRef}>
            <div id="handle">
              Drag here
            </div>
            <div>This is the content</div>
          </div>
        </Draggable>
        <Draggable
          nodeRef={nodeRef}
          handle=".draggable"
          position={null}
          grid={[40, 40]}
          bounds=".canvas"
          offsetParent=""
          scale={1}>
          <div className="draggable" style={{ border: '1px solid #999', padding: '20px' }} ref={nodeRef}>
            <div id="handle">
              Drag here
            </div>
            <div>This is the content</div>
          </div>
        </Draggable>        
      </div>
    </main>
  );
}

export default App;
