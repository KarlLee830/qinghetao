import React from 'react';
import { Input, Checkbox, Radio, Icon, Toast } from '@discuzqsdk/design';
import { ATTACHMENT_TYPE, ACCEPT_FILE_TYPES, ACCEPT_IMAGE_TYPES } from '@common/constants/thread-post';
import DZQUpload from '@components/upload';
import beforeUpload from '@common/utils/before-upload';
import ImageUpload from '../../../../components/thread-post/image-upload';
import FileUpload from '../../../../components/thread-post/file-upload';
import { toJS, set } from 'mobx';
import h5layout from './index.module.scss';
import pclayout from './pc.module.scss';


export const InputType = {
  INPUT: 0,
  TEXTAREA: 1,
  RADIO_GROUP: 2,
  CHECKBOX_GROUP: 3,
  PHOTO: 4,
  FILE: 5,
};

export const CreateFunctions = {
  [InputType.INPUT]: CreateInput,
  [InputType.TEXTAREA]: CreateTextArea,
  [InputType.RADIO_GROUP]: CreateRadioGroup,
  [InputType.CHECKBOX_GROUP]: CreateCheckBoxGroup,
  [InputType.PHOTO]: CreatePhotoUploader,
  [InputType.FILE]: CreateFileUploader,
};


export function CreateInput(field, layout) {
  const { fieldsDesc, name, required } = field;
  return (
    <div className={layout.item} key={name}>
      <div className={layout.input}>
        <div className={layout.label}>
          {requiredSign(required, layout.required)}
          {name}
        </div>
        <Input
          maxLength={100}
          className={layout.input_value}
          value={field.value}
          placeholder={fieldsDesc}
          onChange={(e) => {
            field.value = e.target.value;
          }}
          onBlur={(e) => {
            field.value = e.target.value.trim();
          }}
        />
      </div>
    </div>
  );
}

export function CreateTextArea(field, layout) {
  const { fieldsDesc, name, required } = field;
  return (
    <div className={layout.item} key={name}>
      <div className={layout.textarea}>
        <div className={layout.label}>
          {requiredSign(required, layout.required)}{name}
        </div>
        <Input.Textarea
          trim
          autoHeight={true}
          showLimit={true}
          maxLength={100}
          className={layout.textarea_item}
          value={field.value}
          placeholder={fieldsDesc}
          rows={3}
          onChange={(e) => {
            field.value = e.target.value;
          }}
          onBlur={(e) => {
            field.value = e.target.value.trim();
          }}
        />
      </div>
    </div>
  );
}

export function CreateRadioGroup(field, layout) {
  const { fieldsExt, name, required } = field;
  const { options } = JSON.parse(fieldsExt);
  return (
    <div className={layout.item} key={name}>
      <div className={layout.checkbox}>
        <div className={layout.label}>
          {requiredSign(required, layout.required)}{name}
        </div>
        <Radio.Group
          value={field.value}
          onChange={(checked) => {
            field.value = checked;
          }}
        >
          {options.map(option => (<Radio key={option.value} name={option.value}>{option.value}</Radio>))}
        </Radio.Group>
      </div>
    </div>
  );
}

export function CreateCheckBoxGroup(field, layout) {
  const { fieldsExt, name, required } = field;
  const { options } = JSON.parse(fieldsExt);
  return (
    <div className={layout.item} key={name}>
      <div className={layout.checkbox}>
        <div className={layout.label}>
          {requiredSign(required, layout.required)}{name}
        </div>
        <Checkbox.Group value={field.value} onChange={(checked) => {
          field.value = checked;
        }}>
          {options.map(option => (<Checkbox key={option.value} name={option.value}>{option.value}</Checkbox>))}
        </Checkbox.Group>
      </div>
    </div>
  );
}

const getAttachment = (ret) => {
  if (ret.code !== 0) {
    Toast.error({ content: `${ret.msg} 上传失败` });
    return false;
  }
  const { data: { url, id } } = ret;

  return { url, id };
};

export function CreatePhotoUploader(field, layout, site) {
  const { name, required } = field;
  const data = { type: ATTACHMENT_TYPE.image };
  return (
    <div className={layout.item} key={name}>
      <div className={layout.imgUpload}>
        <div className={layout.label}>
          {requiredSign(required, layout.required)}
          {name}
        </div>
        <ImageUpload
          listType='card'
          btnText=''
          data={data}
          limit={9}
          accept={ACCEPT_IMAGE_TYPES.join(',')}
          onComplete={
            (ret, file) => {
              const att = getAttachment(ret);
              if (att) {
                Object.assign(file, att);
                field.value = field.value.concat([file]);
              }
            }
          }
          onChange={(fileList) => {
            const file = fileList[fileList.length - 1];
            if (file?.status === 'error') {
              fileList.splice(fileList.length - 1);
            }
            field.value = fileList;
          }}
          beforeUpload={(cloneList, showFileList) => beforeUpload(cloneList, showFileList, 'image', site)}
          fileList={field.value}
          className={layout['imgUpload-dom']}
        >
        </ImageUpload>
      </div>
    </div>
  );
}

export function CreateFileUploader(field, layout, site) {
  const { name, required } = field;
  const data = { type: ATTACHMENT_TYPE.file };
  return (
    <div className={layout.item} key={name}>
      <FileUpload
        className={layout.attachmentsUpload}
        multiple={true}
        btnText='上传文件'
        data={data}
        limit={9}
        accept={ACCEPT_FILE_TYPES.join(',')}
        onChange={(fileList) => {
          const file = fileList[fileList.length - 1];
          if (file?.status === 'error') {
            fileList.splice(fileList.length - 1);
          }
          field.value = fileList;
        }}
        onComplete={
          (ret, file) => {
            const att = getAttachment(ret);
            Object.assign(file, att);
          }
        }
        beforeUpload={(cloneList, showFileList) => beforeUpload(cloneList, showFileList, 'file', site)}
        fileList={field.value}
        isCustomUploadIcon={true}
      >
        <span className={layout['attachmentsUpload-left']}>
          {requiredSign(required, layout.required)}
          {name}
        </span>
        <span className={layout['attachmentsUpload-right']}>
          <Icon size='small' name='PaperClipOutlined' />
          {field.fieldsDesc}
        </span>
      </FileUpload>
      <div className={layout.attachmentsUpload_shade}></div>
    </div>
  );
}

function requiredSign(isRequired, className) {
  return isRequired ? <span className={className}>* </span> : '';
}
