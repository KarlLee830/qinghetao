import React from 'react';
import classnames from 'classnames';

/**
 *
 * example:
```js
const columns = [
  {
    title: '金额1',
    key: 'money1',
        render: (item) => {
        return <div>{item.money1}</div>
    },
  },
  {
    title: '金额2',
    key: 'money2',
            render: (item) => {
        return <div>{item.money2}</div>
    },
  },
  {
    title: '金额3',
    key: 'money3',
    render: (item) => {
        return <div>{item.money3}</div>
    },
  },
];
```
 * @param {*} param0
 * @returns
 */
function RenderList({ columns = [], data = [], className = '' }) {
  const titles = columns.map((item) => item.title);

  return (
    <div className={classnames('renderList', className)}>
      <div
        className={'listTitleWrapper'}
        style={{
          display: 'flex',
        }}
      >
        {columns.map(({ title, style }) => (
          <div
            key={title}
            className={'listTitle'}
            style={{
              width: `${100 / columns.length}%`,
              ...style,
            }}
          >
            {title}
          </div>
        ))}
      </div>
      <div className={'listItemWrapper'}>
        {data.map((item, idx) => (
          <div
            key={idx}
            className={'listItem'}
            style={{
              display: 'flex',
            }}
          >
            {columns.map((column) => (
              <div
                className={'listColumn'}
                key={`${column.key} + ${idx}`}
                style={{
                  width: `${100 / columns.length}%`,
                  ...column.style,
                }}
              >
                {column.render(item)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RenderList;
