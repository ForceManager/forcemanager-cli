import React, { PureComponent } from 'react';
import { Toast, toast } from 'hoi-poi-ui';
import moment from 'moment';
import { bridge } from 'fm-bridge';
import FormSelector from './components/FormSelector';
import FormEdit from './components/FormEdit';
import FormSummary from './components/FormSummary';
import Signature from './components/Signature';
import DatePicker from './components/DatePicker';
import TimePicker from './components/TimePicker';
import DateTimePicker from './components/DateTimePicker';
import Textarea from './components/Textarea';
import Checkbox from './components/Checkbox';
import utils from './utils';
import config from './configs/config.json';
import getDefaultValues from './configs/defaultValues';
import customActions from './configs/customActions';
import CONSTANTS from './constants';
import localBridge from './configs/localBridge';

import './App.scss';

class App extends PureComponent {
  state = {
    selectedForm:
      Object.keys(config.formSchema).length > 1
        ? null
        : {
            name: config.formSchema[Object.keys(config.formSchema)[0]].title,
            value: Object.keys(config.formSchema)[0],
          },
    // selectedForm: { name: 'Standard Service', value: 'standardService' },
    formSchema: null,
    imagesView: false,
  };

  componentDidMount() {
    let states = {};
    bridge
      .showLoading()
      .then(() => localBridge.getFormStates())
      // .then(() => bridge.getFormStates())
      .then((res) => {
        res.forEach((el) => {
          states[el.value] = el.label;
        });
      })
      .then(() => localBridge.getFormInitData())
      // .then(() => bridge.getFormInitData())
      .then((res) => {
        let newState;
        if (res.mode === 'creation') {
          bridge.setTitle('Form creation');
          newState = {
            formData: {
              formObject: {
                fechaCreacion: moment().format('MM/DD/YYYY hh:mm A'),
                userCreacion: res.user.id,
              },
              idFormType: null,
              idState: CONSTANTS.STATE.DRAFT,
              endState: 0,
            },
            account: res.account,
            user: res.user,
            entityForm: res.entityForm,
            mode: res.mode,
            isReadonly: res.isReadonly || false,
            idPreSelectedFormType: res.idPreSelectedFormType,
            entityFormExtraFields: res.entityFormExtraFields,
            imei: res.imei,
            states,
          };
        } else if (res.mode === 'edition') {
          bridge.setTitle('Form edition');
          let selectedFormValue = Object.keys(config.formSchema).find(
            (key) => res.idFormType === config.formSchema[key].id,
          );
          let selectedForm = {
            label: config.formSchema[selectedFormValue].title,
            value: selectedFormValue,
          };
          newState = {
            formData: {
              formObject: res.entityForm.fullObject.formObject,
              idFormType: res.idFormType,
              idState: res.entityForm.idState,
              endState: res.entityForm.fullObject.endState,
              listObject: res.entityForm.fullObject.listObject,
              detailObject: res.entityForm.fullObject.detailObject,
            },
            account: res.account,
            user: res.user,
            entityForm: res.entityForm,
            mode: res.mode,
            isReadonly: res.isReadonly || false,
            selectedForm,
            states,
          };
        }
        this.setState({ ...this.state, ...newState });
        bridge.hideLoading();
      })
      .catch((err) => {
        console.warn(err);
      });
  }

  componentDidUpdate() {
    const { selectedForm, formSchema, formData, account, mode } = this.state;

    if (selectedForm && !formSchema) {
      let defaultValues;
      let schemaPromises = [];
      let schemaPositions = [];
      let newFormSchema = JSON.parse(JSON.stringify(config.formSchema[selectedForm.value].schema));
      let newListObject = JSON.parse(JSON.stringify(config.listObject));
      let newDetailObject = JSON.parse(JSON.stringify(config.detailObject));
      bridge.showLoading();

      const mapSections = (sections, currentPath) => {
        sections.forEach((section, sectionIndex) => {
          section.className = [section.className, 'form-page'];
          section.isExpandable = false;
          section.fields = mapFields(section.fields, currentPath[sectionIndex].fields);
        });
      };
      const mapFields = (fields, currentPath) => {
        const newFields = [];
        fields.forEach((field, fieldIndex) => {
          // if (!field.isFullWidth) field.isFullWidth = true;
          // if (field.type !== 'checkbox' && !field.labelMode) field.labelMode = 'vertical';
          if (field.isVisible !== false) {
            if (!field.attrs) field.attrs = {};
            field.attrs['className'] = `field-${field.type}`;
            switch (field.type) {
              case 'multiplier':
                mapSections(field.schema, currentPath[fieldIndex].schema);
                break;
              case 'select':
                // field.isSearchable = false;
                field.isFullWidth = true;
                if (field.attrs && field.attrs.table && field.attrs.table !== '') {
                  schemaPromises.push(
                    bridge
                      .getValueList(field.attrs.table)
                      .then((res) => {
                        field.attrs.options = res;
                      })
                      .catch((err) => {
                        console.warn(err);
                      }),
                  );
                  schemaPositions.push(currentPath[fieldIndex].attrs.options);
                } else if (
                  field.attrs &&
                  field.attrs.relatedEntity &&
                  field.attrs.relatedEntity !== ''
                ) {
                  const id =
                    field.attrs.relatedEntity[1] === 'accounts' &&
                    field.attrs.relatedEntity[2] === 'this'
                      ? account.id
                      : field.attrs.relatedEntity[2];
                  schemaPromises.push(
                    bridge
                      .getRelatedEntity(
                        field.attrs.relatedEntity[0],
                        field.attrs.relatedEntity[1],
                        id,
                      )
                      .then((res) => {
                        field.attrs.options = [
                          ...field.attrs.options,
                          ...utils.formatEntityList(field.attrs.relatedEntity[0], res),
                        ];
                      })
                      .catch((err) => {
                        console.warn(err);
                        toast({
                          type: 'error',
                          text: 'Get value list failed',
                          title: 'Error',
                        });
                      }),
                  );
                  schemaPositions.push(currentPath[fieldIndex].attrs.options);
                }
                break;
              case 'checkboxGroup':
              case 'text':
              case 'datePicker':
              case 'dateTimePicker':
              case 'dateTime':
              default:
            }
            newFields.push(field);
          }
        });
        return newFields;
      };

      function setListObject() {
        return new Promise((resolve, reject) => {
          Object.keys(newListObject).forEach((key) => {
            switch (newListObject[key]) {
              case 'selectedForm':
                newListObject[key] = selectedForm.label;
                break;
              case 'state':
                newListObject[key] = CONSTANTS.LITERALS.STATE[formData.idState]['en'];
                break;
              case 'creationDate':
                newListObject[key] = formData.formObject.fechaCreacion;
                break;
              default:
            }
          });
          resolve();
        });
      }

      function setDetailObject() {
        return new Promise((resolve, reject) => {
          newDetailObject.detailValues.forEach((element) => {
            switch (element.value) {
              case 'selectedForm':
                element.value = selectedForm.label;
                break;
              case 'state':
                element.value = CONSTANTS.LITERALS.STATE[formData.idState]['en'];
                break;
              case 'creationDate':
                element.value = formData.formObject.fechaCreacion;
                break;
              default:
            }
          });
          resolve();
        });
      }

      if (mode === 'creation') {
        mapSections(newFormSchema, newFormSchema);

        Promise.all(schemaPromises)
          .then((res) => {
            res.forEach((el, i) => {
              schemaPositions[i] = el;
            });
            return getDefaultValues(this.state, selectedForm.value);
          })
          .then((res) => {
            defaultValues = res;
            return setListObject();
          })
          .then(() => setDetailObject())
          .then(() => {
            this.setState({
              ...this.state,
              formSchema: newFormSchema,
              formData: {
                ...formData,
                formObject: {
                  ...formData.formObject,
                  ...defaultValues,
                },
                listObject: newListObject,
                detailObject: newDetailObject,
                idFormType: config.formSchema[selectedForm.value].id,
              },
            });
            bridge.hideLoading();
          })
          .catch((err) => {
            console.warn(err);
          });
      } else if (mode === 'edition' && !formData.endState) {
        mapSections(newFormSchema, newFormSchema, false);

        Promise.all(schemaPromises)
          .then((res) => {
            res.forEach((el, i) => {
              schemaPositions[i] = el;
            });
            this.setState({
              ...this.state,
              formSchema: newFormSchema,
            });
            bridge.hideLoading();
          })
          .catch((err) => {
            console.warn(err);
          });
      } else if (mode === 'edition' && formData.endState) {
        this.setState({
          formSchema: [...config.formSchema[selectedForm.value].schema],
        });
      }
    }
  }

  setImagesView = (value) => {
    this.setState({ imagesView: value });
  };

  onFieldFocus = (values, field, currentPage) => {
    const { formData, formSchema } = this.state;
    const sectionName = formSchema[currentPage].name;

    if (field.subType === 'date') {
      bridge
        .openDatePicker()
        .then((res) => {
          this.setState({
            formData: {
              ...formData,
              formObject: {
                ...formData.formObject,
                [sectionName]: {
                  ...formData.formObject[sectionName],
                  [field.name]: res,
                },
              },
            },
          });
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  };

  onSelectorChange = (value) => this.setState({ selectedForm: value });

  onFormChange = (values, field, currentPage) => {
    const { formData, formSchema, selectedForm } = this.state;
    const sectionName = formSchema[currentPage].name;

    if (field.type === 'checkbox') {
      if (formData.formObject[sectionName][field.name]) {
        values[field.name] = false;
      } else {
        values[field.name] = true;
      }
    }

    let newState = {
      formData: {
        ...formData,
        formObject: {
          ...formData.formObject,
          [sectionName]: values,
        },
      },
    };
    if (
      customActions.onChange &&
      customActions.onChange[selectedForm.value][sectionName] &&
      customActions.onChange[selectedForm.value][sectionName][field.name]
    ) {
      let data = {
        state: { ...this.state, ...newState },
        values,
        field,
        currentPage,
      };
      customActions.onChange[selectedForm.value][sectionName][field.name](data)
        .then((res) => {
          this.setState({
            ...newState,
            ...res,
          });
        })
        .catch((err) => {
          console.warn(err);
          this.setState({ ...newState });
        });
    } else {
      this.setState({ ...newState });
    }
  };

  // onChangePage = (currentPage) => {
  //   if (customActions.onChangePage) {
  //     let data = { state: this.state, currentPage };
  //     customActions
  //       .onChangePage(data)
  //       .then((newSate) => {
  //         if (newSate) {
  //           this.setState({ ...newSate });
  //         }
  //       })
  //       .catch((err) => console.warn(err));
  //   }
  // };

  beforeChangePage = (currentPage) => {
    return new Promise((resolve, reject) => {
      if (customActions.beforeChangePage) {
        let data = { state: this.state, currentPage };
        customActions
          .beforeChangePage(data)
          .then((newSate) => {
            if (newSate) {
              this.setState({ ...newSate });
              resolve(newSate);
            } else {
              resolve();
            }
          })
          .catch((err) => reject(err));
      } else {
        resolve();
      }
    });
  };

  overrides = {
    Select: { menu: {} },
  };

  customFields = {
    datePicker: DatePicker,
    timePicker: TimePicker,
    dateTimePicker: DateTimePicker,
    signature: Signature,
    textarea: Textarea,
    checkbox: Checkbox,
  };

  renderContent() {
    const { mode, selectedForm, formData, formSchema, imagesView } = this.state;

    if (mode === 'creation' && !selectedForm) {
      return (
        <FormSelector
          schema={config.formSchema}
          selectedForm={selectedForm}
          onChange={this.onSelectorChange}
        />
      );
    } else if (
      formSchema &&
      ((mode === 'creation' && selectedForm) || (mode === 'edition' && !formData.endState))
    ) {
      return (
        <FormEdit
          schema={formSchema}
          onChange={this.onFormChange}
          onFocus={this.onFieldFocus}
          formData={formData}
          customFields={this.customFields}
          setImagesView={this.setImagesView}
          imagesView={imagesView}
          overrrides={this.overrides}
          onChangePage={this.onChangePage}
          beforeChangePage={this.beforeChangePage}
        />
      );
    } else if (formSchema && mode === 'edition' && formData.endState) {
      return (
        <FormSummary
          schema={formSchema}
          values={formData.formObject}
          customFields={this.customFields}
        />
      );
    } else {
      return;
    }
  }

  render() {
    return (
      <div className="fom-container">
        {this.renderContent()}
        <Toast />
      </div>
    );
  }
}

export default App;
