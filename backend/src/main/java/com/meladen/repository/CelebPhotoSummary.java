package com.meladen.repository;

/** List view without loading image BLOBs. */
public interface CelebPhotoSummary {
  Long getId();

  String getSectionName();

  Integer getSortOrder();
}
