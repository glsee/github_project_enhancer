const toArray = (nodes) => {
  return [].map.call(nodes, node => node);
}

const getProjectColumns = () => {
  return document.querySelectorAll('.project-column');
}

const getStoryPointLabels = (column, pattern) => {
  const labels = toArray(column.querySelectorAll('.issue-card-label'));
  return labels.filter(label => pattern.test(label.innerText));
}

const findOrCreateStoryPointConter = (column) => {
  const storyPointConter = column.querySelector('.js-column-story-point-count');
  if (storyPointConter) {
    return storyPointConter;
  } else {
    const newStoryPointCounter = document.createElement('span');
    newStoryPointCounter.classList.add('Counter');
    newStoryPointCounter.classList.add('Counter--green-light');
    newStoryPointCounter.classList.add('js-column-story-point-count');
    const columnHeader = column.querySelector('.js-details-container > .hide-sm > h4');
    const cardCounter = column.querySelector('.js-column-card-count');
    columnHeader.insertBefore(newStoryPointCounter, cardCounter.nextSibling);
    return newStoryPointCounter;
  }
}

const setStoryPoint = (column, points) => {
  const storyPointConter = findOrCreateStoryPointConter(column);
  storyPointConter.textContent = points + 'pt'
}

const calculateStoryPoints = (column, pattern) => {
  const storyPointLabels = getStoryPointLabels(column, pattern);
  const storyPoints = storyPointLabels.reduce((total, storyPointLabel) => {
    return total + parseInt(pattern.exec(storyPointLabel.innerText)[1]);
  }, 0)
  setStoryPoint(column, storyPoints);
}

const calculateStoryPointsForEachColumns = (pattern) => {
  getProjectColumns().forEach(column => calculateStoryPoints(column, pattern));
}

const initialize = (pattern) => {
  const columnContainer = document.querySelector('.project-columns-container');
  columnContainer.ondragend = () => {
    calculateStoryPointsForEachColumns(pattern);
  };
  calculateStoryPointsForEachColumns(pattern);
}

// GitHub Project columns are loaded as async.
// This function detect it finished.
const detectFinishToLoadCards = async (column) => {
  return new Promise(resolve => {
    let attempts = 0;
    const detect = (targetColumn) => {
      if (targetColumn.querySelector('.issue-card') || attempts >= 10) {
        return resolve(true);
      } else {
        attempts++;
        setTimeout(() => detect(targetColumn), 100);
      }
    }
    return detect(column);
  });
}

(async () => {
  const pattern = /(\d+)pt/;
  const projectColumns = toArray(getProjectColumns());
  await Promise.all(
    projectColumns.map(column => detectFinishToLoadCards(column))
  );
  const numOfPointLabels = projectColumns.reduce((total, column) => {
    return total + getStoryPointLabels(column, pattern).length;
  }, 0);
  if (numOfPointLabels > 0) {
    initialize(pattern);
  }
  return;
})();
