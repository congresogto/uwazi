import translations from 'api/i18n/translations';

import { Settings, SettingsLinkSchema, SettingsFilterSchema } from 'shared/types/settingsType';
import { ensure } from 'shared/tsUtils';
import { LanguageSchema, ObjectIdSchema } from 'shared/types/commonTypes';
import { validateSettings } from 'shared/types/settingsSchema';

import { settingsModel } from './settingsModel';

const DEFAULT_MAP_TILER_KEY = 'QiI1BlAJNMmZagsX5qp7';

const getUpdatesAndDeletes = (
  newValues: (SettingsLinkSchema & SettingsFilterSchema)[] = [],
  currentValues: (SettingsLinkSchema & SettingsFilterSchema)[] = [],
  matchProperty: keyof (SettingsLinkSchema & SettingsFilterSchema),
  propertyName: keyof (SettingsLinkSchema & SettingsFilterSchema)
) => {
  const updatedValues: { [k: string]: any } = {};
  const deletedValues: string[] = [];

  currentValues.forEach((value: SettingsFilterSchema & SettingsLinkSchema) => {
    const matchValue = newValues.find(
      v => v[matchProperty] && v[matchProperty]?.toString() === value[matchProperty]?.toString()
    );

    if (matchValue && matchValue[propertyName] !== value[propertyName]) {
      if (value[propertyName]) {
        updatedValues[ensure<string>(value[propertyName])] = matchValue[propertyName];
      }
    }
    if (!matchValue) {
      deletedValues.push(ensure<string>(value[propertyName]));
    }
  });

  const values = newValues.reduce(
    (result, value) =>
      Object.assign({}, result, { [ensure<string>(value[propertyName])]: value[propertyName] }),
    {}
  );

  return { updatedValues, deletedValues, values };
};

const saveLinksTranslations = async (
  newLinks: Settings['links'],
  currentLinks: Settings['links'] = []
) => {
  if (!newLinks) {
    return Promise.resolve();
  }

  const { updatedValues, deletedValues, values } = getUpdatesAndDeletes(
    newLinks,
    currentLinks,
    '_id',
    'title'
  );

  return translations.updateContext(
    'Menu',
    'Menu',
    updatedValues,
    deletedValues,
    values,
    'Uwazi UI'
  );
};

const saveFiltersTranslations = async (
  _newFilters: Settings['filters'],
  _currentFilters: Settings['filters'] = []
) => {
  if (!_newFilters) {
    return Promise.resolve();
  }

  const newFilters = _newFilters.filter(item => item.items);
  const currentFilters = _currentFilters.filter(item => item.items);

  const { updatedValues, deletedValues, values } = getUpdatesAndDeletes(
    newFilters,
    currentFilters,
    'id',
    'name'
  );
  return translations.updateContext(
    'Filters',
    'Filters',
    updatedValues,
    deletedValues,
    values,
    'Uwazi UI'
  );
};

function removeTemplate(filters: SettingsFilterSchema[], templateId: ObjectIdSchema) {
  const filterTemplate = (filter: SettingsFilterSchema) => filter.id !== templateId;
  return filters.filter(filterTemplate).map(_filter => {
    const filter = _filter;
    if (filter.items) {
      filter.items = removeTemplate(filter.items, templateId);
    }
    return filter;
  });
}

function setDefaults(storedSettings: Settings[]) {
  const [settings] = storedSettings;
  if (settings) settings.mapTilerKey = settings.mapTilerKey || DEFAULT_MAP_TILER_KEY;
  return settings || {};
}

export default {
  async get(query: any = {}, select: any = '') {
    return ensure<Settings>(
      await settingsModel.get(query, select).then(settings => setDefaults(settings))
    );
  },

  async save(settings: Settings) {
    await validateSettings(settings);
    const currentSettings = await this.get();
    await saveLinksTranslations(settings.links, currentSettings.links);
    await saveFiltersTranslations(settings.filters, currentSettings.filters);
    return settingsModel.save(Object.assign({}, settings, { _id: currentSettings._id }));
  },

  async setDefaultLanguage(key: string) {
    return this.get().then(async currentSettings => {
      const languages = ensure<LanguageSchema[]>(currentSettings.languages).map(_language => {
        const language = Object.assign({}, _language);
        language.default = language.key === key;
        return language;
      });

      return settingsModel.save(Object.assign(currentSettings, { languages }));
    });
  },

  async addLanguage(language: LanguageSchema) {
    const currentSettings = await this.get();
    currentSettings.languages = currentSettings.languages || [];
    currentSettings.languages.push(language);
    return settingsModel.save(currentSettings);
  },

  async deleteLanguage(key: string) {
    const currentSettings = await this.get();
    const languages = ensure<LanguageSchema[]>(currentSettings.languages).filter(
      language => language.key !== key
    );
    return settingsModel.save(Object.assign(currentSettings, { languages }));
  },

  async removeTemplateFromFilters(templateId: ObjectIdSchema) {
    const settings = await this.get();

    if (!settings.filters) {
      return Promise.resolve();
    }

    settings.filters = removeTemplate(settings.filters, templateId);
    return this.save(settings);
  },

  async updateFilterName(filterId: ObjectIdSchema, name: string) {
    const settings = await this.get();

    if (!(settings.filters || []).some(eachFilter => eachFilter.id === filterId)) {
      return Promise.resolve();
    }

    const filter = (settings.filters || []).find(eachFilter => eachFilter.id === filterId);
    if (filter) {
      filter.name = name;
    }

    return this.save(settings);
  },
};
