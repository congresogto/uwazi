import React, {Component, PropTypes} from 'react';
import {DragSource, DropTarget} from 'react-dnd';
import {bindActionCreators} from 'redux';
import {reorderProperty, addProperty} from './templatesActions';
import {connect} from 'react-redux';

class MetadataProperty extends Component {
  render() {
    const {inserting, name, connectDragSource, isDragging, connectDropTarget} = this.props;
    let propertyClass = 'field-option well';
    if (isDragging || inserting) {
      propertyClass += ' dragging';
    }

    return connectDragSource(connectDropTarget(
      <div className={propertyClass}>
        {name}
      </div>
    ));
  }
}

MetadataProperty.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  id: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  inserting: PropTypes.bool
};


const target = {
  drop(props) {
    return props;
  },

  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    if (typeof dragIndex === 'undefined') {
      let item = monitor.getItem();
      item.index = 0;
      return props.addProperty({name: item.name, inserting: true}, item.index);
    }

    props.reorderProperty(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  }
};

let dropTarget = DropTarget(['METADATA_PROPERTY', 'METADATA_OPTION'], target, (connector, monitor) => ({
  connectDropTarget: connector.dropTarget(),
  isOver: monitor.isOver()
}))(MetadataProperty);

const source = {
  beginDrag(props) {
    return {
      index: props.index,
      name: props.name
    };
  }
};

let dragSource = DragSource('METADATA_PROPERTY', source, (connector, monitor) => ({
  connectDragSource: connector.dragSource(),
  isDragging: monitor.isDragging()
}))(dropTarget);

function mapDispatchToProps(dispatch) {
  return bindActionCreators({reorderProperty, addProperty}, dispatch);
}

export {dragSource, dropTarget};
export default connect(null, mapDispatchToProps, null, {withRef: true})(dragSource);