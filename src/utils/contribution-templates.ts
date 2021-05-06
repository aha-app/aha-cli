export default {
  viewTemplate(name: string, title: string, host: string) {
    if (host == 'attribute'){
      return `import React from "react";

const Styles = () => {
  return (
    <style>
      {\`
    .text-class {
      color: var(--aha-black-800);
    }
    \`}
    </style>
  );
};

aha.on("${name}", ({ record, fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Styles />
      <div className='text-class'>${title}</div>
    </>
  );
});`;
    } else {
      return `import React from "react";

const Styles = () => {
  return (
    <style>
      {\`
    .title {
      color: var(--aha-green-800);
      font-size: 20px;
      text-align: center;
      margin: 20px;
    }
    \`}
    </style>
  );
};

aha.on("${name}", ({ ${host != 'page' ? 'record, ' : ''}fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Styles />
      <div className='title'>${title}</div>
    </>
  );
});`;
    }
  },

  commandTemplate(name: string) {
    return `aha.on("${name}", ({ record }, { identifier, settings }) => {
  if (record) {
    aha.commandOutput(
      \`Running sample command for record: \${record.typename} / \${record.referenceNum}.\`
    );
  } else {
    aha.commandOutput(\`Running sample command without a record.\`);
  }
});`;
  },

  endpointTemplate(name: string) {
  return `aha.on("${name}", ({ headers, payload }, { identifier, settings }) => {
  //Endpoint code goes here
});`;
  },

  importerTemplate(identifier: string, name: string) {
    return `const importer = aha.getImporter("${identifier}.${name}");

importer.on({ action: "listCandidates" }, async ({ filters, nextPage }, {identifier, settings}) => {
  return { records: [], nextPage: 2 };
});

//Optional
//importer.on({ action: "listFilters" }, ({}, {identifier, settings}) => {
//  return {
//    filterName: {
//      title: "Filter Name",
//      required: true,
//      type: "text",
//    },
//  };
//});

//Optional
//importer.on({ action: "filterValues" }, async ({ filterName, filters }, {identifier, settings}) => {
//  return [{ text: "Filter Text", value: "Filter Value" }];
//});

//Optional
//importer.on({ action: "renderRecord" }, ({ record, onUnmounted }, { identifier, settings }) => {
//  onUnmounted(() => {
//    console.log("Un-mounting component for", record.identifier);
//  });
//
//  return \`\${record.identifier} \${record.name}\`;
//});

//Optional
//importer.on({ action: "importRecord" }, async ({ importRecord, ahaRecord }, {identifier, settings}) => {
//  //Import record code goes here
//});
`;
  },

  eventHandlerTemplate(events: string[]) {
    let returnTemplate = "";
    events.forEach((event) => {
      returnTemplate += `
aha.on({ event: '${event}' }, (arg, { identifier, settings }) => {
  //Event handler code for ${event}
});
`
    });
    return returnTemplate;
  }
}