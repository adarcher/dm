import React, { useState } from 'react';
import { Button, FileInput, ButtonGroup } from '@blueprintjs/core';
import { GameRoom } from '../../../gameroom';

export const ImportRoom = props => {
  const [file, setFile] = useState(false);
  const handleFile = event => {
    // const filename = event.target.files[0].name;
    // //document.getElementById('IMPORT_FILE').value;
    setFile(event.target.files[0]);
  };

  const handleLoad = event => {
    if (file.size > 0) {
      var reader = new FileReader();
      reader.onload = data => {
        console.log(reader.result);
        var room_raw = JSON.parse(reader.result);
        if (room_raw !== undefined) {
          GameRoom.Load(room_raw);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <ButtonGroup>
        <FileInput
          id='IMPORT_FILE'
          text={file ? file.name : 'Choose file...'}
          onChange={handleFile}
        />
        <Button
          text='Load'
          small={true}
          disabled={!file}
          onClick={handleLoad}
        />
      </ButtonGroup>
    </div>
  );
};

//<FileInput text="Choose file..." small={true} intent={Intent.WARNING} />
//<InputGroup type='file' small={true} rightElement={<Button text='browse' />} />
