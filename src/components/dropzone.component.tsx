import * as React from 'react';
import { Box } from '@mui/material';

type Props = {
  onUpload: (file: FileList) => void;
} & React.PropsWithChildren;

type State = {
  drag: boolean;
  dragCounter: number;
};

export class Dropzone extends React.Component<Props, State> {
  state: State = {
    drag: false,
    dragCounter: 0,
  };
  dropRef = React.createRef<HTMLDivElement>();

  handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleDragIn = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.state.dragCounter++;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      this.setState({ drag: true });
    }
  };

  handleDragOut = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.state.dragCounter--;
    if (this.state.dragCounter === 0) {
      this.setState({ drag: false });
    }
  };

  handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ drag: false });
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this.props.onUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
      this.state.dragCounter = 0;
    }
  };

  componentDidMount() {
    const div = this.dropRef.current;
    if (div) {
      div.addEventListener('dragenter', this.handleDragIn);
      div.addEventListener('dragleave', this.handleDragOut);
      div.addEventListener('dragover', this.handleDrag);
      div.addEventListener('drop', this.handleDrop);
    }
  }

  componentWillUnmount() {
    const div = this.dropRef.current;
    if (div) {
      div.removeEventListener('dragenter', this.handleDragIn);
      div.removeEventListener('dragleave', this.handleDragOut);
      div.removeEventListener('dragover', this.handleDrag);
      div.removeEventListener('drop', this.handleDrop);
    }
  }

  render() {
    const { drag } = this.state;
    const { children } = this.props;
    return (
      <Box
        sx={{
          position: drag ? 'relative' : 'unset',
          minWidth: '200px',
          height: '100%',
        }}
        ref={this.dropRef}
      >
        {drag && (
          <Box
            sx={{
              zIndex: 100,
              position: 'absolute',
              inset: 0,
              border: (theme) => `2px dashed ${theme.palette.primary.main}`,
              backgroundColor: (theme) => theme.palette.action.focus,
            }}
          ></Box>
        )}
        {children}
      </Box>
    );
  }
}
