function getSites() {
  return [
    {
      hostname: "remoteok.com",
      title_selector: "a.preventLink > h2",
      company_selector: "h3",
      location_selector: "div.location",
      tags_selector: "div.tags > a",
      apply_selector: "a.preventLink",
      job_link_selector: "tr.job > td.position > a",
      job_row_selector: "tr.job",
      post_date_selector: "time",
      post_date_attribute: "datetime",
      next_page_selector: "a.next",
      infinite_scroll: true,
    },
  ];
}

module.exports = { getSites };
