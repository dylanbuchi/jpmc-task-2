import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[];
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const element = document.getElementsByTagName(
      'perspective-viewer',
    )[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    type PerspectiveViewerElementAttributes =
      | 'view'
      | 'column-pivots'
      | 'row-pivots'
      | 'columns'
      | 'aggregates';

    const attribute_to_value: Array<
      [PerspectiveViewerElementAttributes, string]
    > = [
      ['view', 'y_line'],
      ['column-pivots', '["stock"]'],
      ['row-pivots', '["timestamp"]'],
      ['columns', '["top_ask_price"]'],
      [
        'aggregates',
        `{"stock": "distinct count",
          "top_ask_price": "avg",
          "top_bid_price": "avg",
          "timestamp": "distinct count"}`,
      ],
    ];

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      // Add more Perspective configurations here.
      element.load(this.table);

      for (const [attribute, value] of attribute_to_value) {
        element.setAttribute(attribute, value);
      }
    }
  }

  componentDidUpdate() {
    // Every time the data props is updated, insert the data into Perspective table
    if (!this.table) return;
    // As part of the task, you need to fix the way we update the data props to
    // avoid inserting duplicated entries into Perspective table again.
    this.table.update(
      this.props.data.map((item: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: item.stock,
          top_ask_price: (item.top_ask && item.top_ask.price) || 0,
          top_bid_price: (item.top_bid && item.top_bid.price) || 0,
          timestamp: item.timestamp,
        };
      }),
    );
  }
}

export default Graph;
