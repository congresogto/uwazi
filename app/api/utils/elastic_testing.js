import { elastic } from 'api/search';
import elasticMapping from '../../../database/elastic_mapping/elastic_mapping';

export default (elasticIndex, search) => ({
  async resetIndex() {
    await elastic.indices.delete({ index: elasticIndex, ignore_unavailable: true });
    return elastic.indices.create({ index: elasticIndex, body: elasticMapping });
  },

  async refresh() {
    await elastic.indices.refresh({ index: elasticIndex });
  },

  async reindex() {
    await this.resetIndex();
    await search.indexEntities({}, '+fullText');
    await this.refresh();
  },

  async putMapping(body) {
    await elastic.indices.putMapping({ index: elasticIndex, body });
  },
});
