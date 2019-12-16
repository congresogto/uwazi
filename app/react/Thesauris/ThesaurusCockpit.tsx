/** @format */
import RouteHandler from 'app/App/RouteHandler';
import { actions } from 'app/BasicReducer';
import { t } from 'app/I18N';
import ThesaurisAPI from 'app/Thesauris/ThesaurisAPI';
import React from 'react';
import { connect } from 'react-redux';

/** Model is the type used for holding information about a classifier model. */
interface ClassifierModel {
  name: string;
  preferred: string;
  bert: string;
  sample: number;
}

class ThesaurusCockpit extends RouteHandler {
  static async requestState(requestParams: any) {
    // Thesauri should always have a length of 1
    const thesauri = await ThesaurisAPI.getThesauri(requestParams);
    const thesaurus = thesauri[0];

    // Fetch models associated with known thesauri.
    const modelParams = requestParams.onlyHeaders().set({ model: thesaurus.name });
    const model: ClassifierModel = await ThesaurisAPI.getModelStatus(modelParams);

    return [
      actions.set('dictionaries', thesauri),
      actions.set('thesauri/thesaurus', thesaurus),
      actions.set('thesauri/models', [model]),
    ];
  }

  render() {
    const { values: topics } = this.props.thesauri; // {name: Themes; values: [{label: Education}, ...]}
    const { name } = this.props.thesauri; // {name: Themes; values: [{label: Education}, ...]}
    const modelInfo = this.props.models.find((model: ClassifierModel) => model.name === name);

    return (
      <div className="panel panel-default">
        <div className="panel-heading">{t('System', `${name}`)}</div>
        {modelInfo === undefined ? null : (
          <div className="item item-info">
            <ul>
              <p>Classifier Instance: {modelInfo.preferred}</p>
              <p>BERT: {modelInfo.bert}</p>
            </ul>
          </div>
        )}
        <ul className="list-group">
          {topics.map((topic: { label: string }) => (
            <li key={topic.label} className="list-group-item">
              {topic.label}
              <div className="item item-info">
                <ul>
                  <p>Completeness: {modelInfo.topics[topic.label].completeness}</p>
                  <p>Extraneous: {modelInfo.topics[topic.label].extraneous}</p>
                  <p>Number of Samples: {modelInfo.topics[topic.label].samples}</p>
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <div className="settings-footer" />
      </div>
    );
  }
}

function mapStateToProps(state: any) {
  console.dir(`thesauri: ${state.thesauri.thesaurus.toJS()}`);
  console.dir(`dictionaries: ${state.dictionaries.toJS()}`);
  return {
    models: state.thesauri.models.toJS(),
    //thesauri: state.dictionaries
    //.find((thesaurus: any) => thesaurus.name === state.thesauri.models.toJS().name)
    //.thesaurus.toJS(), // {name: Themes; values: [{label: Education, id: lkajsdf}, ...]}
    // TODO: FIX ME I"M EMPTY
    thesauri: state.thesauri.thesaurus.toJS(), // {name: Themes; values: [{label: Education, id: lkajsdf}, ...]}
  };
}

export default connect(
  mapStateToProps,
  null
  //{ withRef: true }
)(ThesaurusCockpit);
