const path = require('path');
const find = require('find');
const parse = require('csv-parse');
const fs = require('fs');

const statementsFolder = path.join(__dirname, '/statements');

find.file(/\.csv$/, statementsFolder, function (statements) {
  if (statements.length) {
    const statement = statements[0];
    processStatement(statement);
  }
});

const processStatement = (statementFile) => {
  fs.readFile(statementFile, 'utf8', function (fileReadError, fileData) {
    if (fileReadError) {
      console.log('Error reading file', fileReadError);
    } else {
      parse(fileData, {
        auto_parse: true,
        comment: '#',
        skip_empty_lines: true,
        relax_column_count: true
      }, function (parseError, output) {
        if (parseError) {
          console.log('Error parsing file', parseError);
        } else {
          processStatementArray(output);
        }
      });
    }
  });
};

const removeWhitespaceAndInitialQuote = (statementArray) => statementArray.map((statementLine) =>
  statementLine.map((statementLineItem) => {
    if (typeof statementLineItem === 'string') {
      return statementLineItem.trim().replace(/'(.*)/, '$1');
    }

    return statementLineItem;
  })
);

function toCamelCase (str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

const getLabelsAndObjectArray = (statementArray) => {
  const [labelsRow, ...dataRows] = statementArray;
  const { labelsAndNames, namesArray } = getNamesAndLabels(labelsRow);

  const statementObjectArray = dataRows.map((dataRow, dataRowIndex) =>
    dataRow.reduce(
      (acc, item, itemIndex) => {
        const newItem = [];

        if (typeof item !== 'string' || item !== '') {
          newItem[namesArray[itemIndex]] = item;
        }

        return {
          ...acc,
          ...newItem
        };
      },
      { id: dataRowIndex }
    )
  );

  return { labelsAndNames, statementObjectArray };
};

const getNamesAndLabels = (labelsRow) => {
  const labelsAndNames = {};
  const namesArray = [];

  for (let index = 0; index < labelsRow.length; index++) {
    const label = labelsRow[index];
    const name = toCamelCase(label);
    labelsAndNames[name] = label;
    namesArray.push(name);
  }

  return {
    labelsAndNames,
    namesArray
  };
};

const writeJsonFileToDisk = (jsonData, filename) => {
  const filepath = `statements/${filename}`;
  fs.writeFile(filepath, JSON.stringify(jsonData, null, 2), (err) => {
    // throws an error, you could also catch it here
    if (err) {
      console.log('Error writing file', err);
    }

    console.log(`JSON file saved: ${filepath}`);
  });
};

const processStatementArray = (statementArray) => {
  const statementWithTrimmedFields = removeWhitespaceAndInitialQuote(statementArray);
  const { labelsAndNames: labels, statementObjectArray: transactions } = getLabelsAndObjectArray(statementWithTrimmedFields);

  writeJsonFileToDisk({ transactions, labels }, 'db.json');
};
