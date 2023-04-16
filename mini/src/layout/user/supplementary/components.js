import React from 'react';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Checkbox from '@discuzqsdk/design/dist/components/checkbox/index';
import Radio from '@discuzqsdk/design/dist/components/radio/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View } from '@tarojs/components';
import { ATTACHMENT_TYPE, ACCEPT_FILE_TYPES, ACCEPT_IMAGE_TYPES, THREAD_TYPE } from '@common/constants/thread-post';
import Upload from './upload';

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
    <View className={layout.item} key={name}>
      <View className={layout.input}>
        <View className={layout.label}>
          {requiredSign(required, layout.required)}
          {name}
        </View>
        <Input
          maxLength={100}
          className={layout.input_value}
          value={field.value}
          placeholder={fieldsDesc}
          placeholderClass={layout.placeholder}
          onChange={(e) => {
            field.value = e.target.value;
          }}
          onBlur={(e) => {
            field.value = e.target.value.trim();
          }}
        />
      </View>
    </View>
  );
}

export function CreateTextArea(field, layout) {
  const { fieldsDesc, name, required } = field;
  return (
    <View className={layout.item} key={name}>
      <View className={layout.textarea}>
        <View className={layout.label}>
          {requiredSign(required, layout.required)}
          {name}
        </View>
        <Input.Textarea
          showLimit
          maxLength={100}
          className={layout.textarea_item}
          value={field.value}
          placeholder={fieldsDesc}
          placeholderClass={layout.placeholder}
          rows={3}
          disableDefaultPadding={true}
          onChange={(e) => {
            field.value = e.target.value;
          }}
          onBlur={(e) => {
            field.value = e.target.value.trim();
          }}
        />
      </View>
    </View>
  );
}

export function CreateRadioGroup(field, layout) {
  const { fieldsExt, name, required } = field;
  const { options } = JSON.parse(fieldsExt);
  return (
    <View className={layout.item} key={name}>
      <View className={layout.checkbox}>
        <View className={layout.label}>
          {requiredSign(required, layout.required)}
          {name}
        </View>
        <Radio.Group
          value={field.value}
          onChange={(checked) => {
            field.value = checked;
          }}
        >
          {options.map((option) => (
            <Radio key={option.value} name={option.value}>
              {option.value}
            </Radio>
          ))}
        </Radio.Group>
      </View>
    </View>
  );
}

export function CreateCheckBoxGroup(field, layout) {
  const { fieldsExt, name, required } = field;
  const { options } = JSON.parse(fieldsExt);
  return (
    <View className={layout.item} key={name}>
      <View className={layout.checkbox}>
        <View className={layout.label}>
          {requiredSign(required, layout.required)}
          {name}
        </View>
        <Checkbox.Group
          value={field.value}
          onChange={(checked) => {
            field.value = checked;
          }}
        >
          {options.map((option) => (
            <Checkbox key={option.value} name={option.value}>
              {option.value}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </View>
    </View>
  );
}

const getAttachment = (ret) => {
  {
    if (ret.code !== 0) {
      Toast.error({ content: `${ret.msg} 上传失败` });
      return false;
    }
    const { data: { url, id } } = ret;

    return { url, id };
  }
};

export function CreatePhotoUploader(field, layout) {
  const { name, required } = field;
  return (
    <View className={layout.item} key={name}>
      <View className={layout.imgUpload}>
        <View className={layout.label}>
          {requiredSign(required, layout.required)}
          {name}
        </View>
        <Upload
          type={THREAD_TYPE.image}
          attachList={field.value || []}
          config={{ label: ' ', className: 'imgUpload-item' }}
          onUpload={(fileList) => {
            field.value = [...fileList];
          }}
          onDelete={(fileList) => {
            field.value = [...fileList];
          }}
        ></Upload>
      </View>
    </View>
  );
}

export function CreateFileUploader(field, layout) {
  const { name, required, fieldsDesc } = field;
  return (
    <View className={layout.item} key={name}>
      <View className={layout.attachmentsUpload}>
        <View className={layout['attachmentsUpload-left']}>
          {requiredSign(required, layout.required)}
          {name}
        </View>
        <View className={layout['attachmentsUpload-right']}>
          {/* 仅上传 */}
          <Upload
            type={THREAD_TYPE.file}
            attachList={field.value || []}
            config={{ uploadOnly: true, label: fieldsDesc }}
            onUpload={(fileList) => {
              field.value = [...fileList];
            }}
          ></Upload>
        </View>
      </View>
      <View className={layout['attachments-list']}>
        {/* 仅展示文件列表 */}
        <Upload
          type={THREAD_TYPE.file}
          attachList={field.value || []}
          config={{ listOnly: true }}
          onDelete={(fileList) => {
            field.value = [...fileList];
          }}
        ></Upload>
      </View>
    </View>
  );
}

function requiredSign(isRequired, className) {
  return isRequired ? <view className={className}>* </view> : '';
}
