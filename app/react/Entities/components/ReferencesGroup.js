import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {is, fromJS as Immutable} from 'immutable';

import {NeedAuthorization} from 'app/Auth';
import ShowIf from 'app/App/ShowIf';
import {Item} from 'app/Layout';
import {I18NLink} from 'app/I18N';
import {advancedSort} from 'app/utils/advancedSort';

export class ReferencesGroup extends Component {

  toggleGroup() {
    this.setState({expanded: !this.state.expanded});
  }

  componentWillMount() {
    this.setState({expanded: false});
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !is(this.props.group, nextProps.group) ||
           !is(this.props.sort, nextProps.sort) ||
           this.state.expanded !== nextState.expanded;
  }

  render() {
    const group = this.props.group.toJS();
    const {connectionType, connectionLabel, templateLabel} = group;

    const sortValues = this.props.sort.toJS();
    const sortOptions = {
      property: ['doc'].concat(sortValues.sort.split('.')),
      order: sortValues.order,
      treatAs: sortValues.treatAs
    };

    const refs = advancedSort(group.refs.map(reference => {
      return {
        reference,
        doc: {
          sharedId: reference.connectedDocument,
          type: reference.connectedDocumentType,
          title: reference.connectedDocumentTitle,
          icon: reference.connectedDocumentIcon,
          template: reference.connectedDocumentTemplate,
          metadata: reference.connectedDocumentMetadata,
          published: reference.connectedDocumentPublished,
          creationDate: reference.connectedDocumentCreationDate
        }
      };
    }), sortOptions);
    const groupClassName = this.state.expanded ? 'is-expanded' : 'is-collapsed';

    return (
      <div className="item-group">
        <button className={`item-group-header ${groupClassName}`} onClick={this.toggleGroup.bind(this)}>
          <div className="title">
            <ShowIf if={connectionType === 'metadata'}>
              <span className="itemGroup-title">{connectionLabel} in {templateLabel}</span>
            </ShowIf>
            <ShowIf if={connectionType === 'connection'}>
              <span className="itemGroup-title">{connectionLabel}</span>
            </ShowIf>
            <span className="multiselectItem-results">{refs.length}</span>
            <i className={`fa ${this.state.expanded ? 'fa-minus' : 'fa-plus'}`}></i>
          </div>
        </button>

        {refs.map((data, index) => {
          if (!this.state.expanded) {
            return false;
          }

          const reference = data.reference;
          const doc = data.doc;

          return (
            <Item
              key={index}
              doc={Immutable(doc)}
              additionalText={reference.text}
              templateClassName="item-label-group"
              evalPublished={true}
              buttons={
                <div className="item-shortcut-group">
                  <NeedAuthorization>
                    <ShowIf if={reference.sourceType !== 'metadata'}>
                      <a className="item-shortcut" onClick={this.props.deleteReference.bind(this, reference)}>
                        <i className="fa fa-trash"></i>
                      </a>
                    </ShowIf>
                  </NeedAuthorization>
                  &nbsp;
                  <I18NLink
                    to={`/${doc.type}/${doc.sharedId}`}
                    onClick={e => e.stopPropagation()}
                    className="item-shortcut">
                    <span className="itemShortcut-arrow">
                      <i className="fa fa-external-link"></i>
                    </span>
                  </I18NLink>
                </div>
              }
            />
          );
        })}
      </div>
    );
  }
}

ReferencesGroup.propTypes = {
  group: PropTypes.object,
  deleteReference: PropTypes.func,
  sort: PropTypes.object
};

export const mapStateToProps = ({entityView}) => {
  return {sort: Immutable(entityView.sort)};
};

export default connect(mapStateToProps)(ReferencesGroup);
